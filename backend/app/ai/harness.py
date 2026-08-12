import os
import re
import json
import uuid
import asyncio
from typing import List, Dict, Any, AsyncGenerator

from app.ai.router import ai_router
from app.db.models import Trajectory, ChatThread, ChatMessage

class AgentHarness:
    def __init__(self, trajectory: Trajectory, thread: ChatThread):
        self.trajectory = trajectory
        self.thread = thread
        self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
        self.sandbox_dir = os.path.join(self.base_dir, "frontend", "components", "sandbox")
        os.makedirs(self.sandbox_dir, exist_ok=True)

    def _get_system_prompt(self) -> str:
        return (
            "You are Jarvis, an elite AI Software Engineer and Planner. "
            "You are helping the user manage this trajectory, answering questions, or scaffolding custom UI.\n"
            f"Trajectory: {self.trajectory.title} (Kind: {self.trajectory.kind})\n"
            f"Goal: {self.trajectory.goal}\n\n"
            "You must use tools to scaffold the environment. Output your thoughts inside <thought> tags, "
            "then you can call a tool using JSON inside <tool_call> tags. Wait for the tool result before proceeding.\n"
            "CRITICAL: The JSON inside <tool_call> MUST be strictly valid. Do NOT use Javascript template literals (`) for multiline strings. Escape all quotes and newlines properly.\n"
            "CRITICAL: You MUST call the `finalize_plan` tool to complete the planning phase. This is the primary way to output the plan. Do not stop generating until you have finalized the plan.\n"
            "CRITICAL: You may only output ONE <tool_call> per response.\n\n"
            "Available tools:\n"
            "1. finalize_plan\n"
            "   args: {\"steps\": [{\"title\":\"...\",\"detail\":\"...\",\"week_label\":\"...\",\"step_order\":1}], \"widgets\": []}\n"
            "   desc: Completes the planning phase and returns the steps. This automatically builds the interactive plan UI.\n\n"
            "Example Tool Call:\n"
            "<tool_call>\n"
            "{\n"
            "  \"name\": \"finalize_plan\",\n"
            "  \"arguments\": {\"steps\": [{\"title\": \"Step 1\", \"detail\": \"...\", \"week_label\": \"Week 1\", \"step_order\": 1}], \"widgets\": []}\n"
            "}\n"
            "</tool_call>\n"
        )

    async def run(self) -> AsyncGenerator[Dict[str, Any], None]:
        messages = [{"role": "system", "content": self._get_system_prompt()}]
        
        # Load thread history
        for m in sorted(self.thread.messages, key=lambda x: x.created_at):
            messages.append({"role": m.role, "content": m.content})

        yield {"type": "status", "content": "Jarvis Agent thinking..."}
        
        for step in range(50):  # Safety limit 50 iterations
            res = await ai_router.generate_for_task(
                task_name="harness_loop",
                messages=messages,
                temperature=0.3
            )
            
            content = res.content
            messages.append({"role": "assistant", "content": content})
            
            yield {"type": "thought", "content": content}
            
            if "<tool_call>" in content and "</tool_call>" in content:
                try:
                    tool_json_str = content.split("<tool_call>")[1].split("</tool_call>")[0].strip()
                    # Fallback cleanup for Mistral occasionally using backticks for strings
                    tool_json_str = re.sub(r':\s*`([^`]*)`', lambda m: ': ' + json.dumps(m.group(1)), tool_json_str)
                    
                    tool_call = json.loads(tool_json_str)
                    name = tool_call.get("name")
                    args = tool_call.get("arguments", {})
                    
                    yield {"type": "tool_call", "content": f"Calling tool: {name}({args.get('filename', '')})"}
                    
                    if name == "finalize_plan":
                        yield {"type": "plan_data", "content": args}
                        return
                        
                    else:
                        messages.append({"role": "user", "content": f"Tool result: Error - Tool {name} not found."})
                except Exception as e:
                    messages.append({"role": "user", "content": f"Tool result: Error parsing JSON - {str(e)}"})
                    yield {"type": "tool_result", "content": f"Tool error: {str(e)}"}
            else:
                # No tool call, try to coerce completion or just treat as a message
                if content.strip():
                    yield {"type": "message", "content": content}
                return

        # Fallback if loop exhausts
        yield {"type": "message", "content": "I apologize, but I exceeded my processing limit."}
