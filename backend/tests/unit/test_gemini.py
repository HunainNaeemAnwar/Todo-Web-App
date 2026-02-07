
import os
import asyncio
import json
import uuid
from openai import AsyncOpenAI
from agents import Agent, Runner, set_default_openai_client, set_default_openai_api
from agents.run import RunConfig
from dotenv import load_dotenv

load_dotenv()

async def test_gemini():
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        print("Error: GEMINI_API_KEY not found")
        return

    print(f"Using Gemini API Key: {gemini_api_key[:10]}...")

    # 1. Configure the custom client for Gemini
    gemini_client = AsyncOpenAI(
        api_key=gemini_api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )

    # 2. Set the SDK to use this client
    set_default_openai_client(gemini_client)
    set_default_openai_api("chat_completions")

    # 3. Create agent (without MCP for now just to test Gemini connection)
    agent = Agent(
        name="test_assistant",
        instructions="You are a helpful assistant.",
        model="gemini-2.5-flash",
    )

    print("Running agent...")
    try:
        result = await Runner.run(
            agent,
            [{"role": "user", "content": "Hello, who are you?"}],
            run_config=RunConfig(tracing_disabled=True)
        )
        print(f"Response: {result.final_output}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_gemini())
