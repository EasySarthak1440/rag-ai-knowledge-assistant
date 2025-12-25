import os
from groq import Groq

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

if not os.getenv("GROQ_API_KEY"):
    raise ValueError("GROQ_API_KEY environment variable not set")


def generate_answer(prompt):
    response = client.chat.completions.create(
        model="meta-llama/Llama-4-Maverick-17B-128E-Instruct",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )
    return response.choices[0].message.content
