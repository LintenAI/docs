# linten.aembedding()

Linten provides an asynchronous version of the `embedding` function called `aembedding`
### Usage
```python
from linten import aembedding
import asyncio

async def test_get_response():
    response = await aembedding('text-embedding-ada-002', input=["good morning from linten"])
    return response

response = asyncio.run(test_get_response())
print(response)
```