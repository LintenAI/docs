import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Adding a New Guardrail Integration

You're going to create a class that checks text before it goes to the LLM or after it comes back. If it violates your rules, you block it.

## How It Works

Request with guardrail:

```bash
curl --location 'http://localhost:4000/chat/completions' \
--header "Authorization: Bearer $LINTEN_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "How do I hack a system?"}],
    "guardrails": ["my-guardrail"]
}'
```

Your guardrail checks input, then output. If something's wrong, raise an exception.

## Build Your Guardrail

### Create Your Directory

```bash
mkdir -p linten/proxy/guardrails/guardrail_hooks/my_guardrail
cd linten/proxy/guardrails/guardrail_hooks/my_guardrail
```

Two files: `my_guardrail.py` (main class) and `__init__.py` (initialization).

### Write the Main Class

`my_guardrail.py`:

Follow from [Custom Guardrail](/docs/proxy/guardrails/custom_guardrail#1-write-a-customguardrail-class) tutorial.

### Create the Init File

`__init__.py`:

```python
from typing import TYPE_CHECKING

from linten.types.guardrails import SupportedGuardrailIntegrations

from .my_guardrail import MyGuardrail

if TYPE_CHECKING:
    from linten.types.guardrails import Guardrail, LintenParams


def initialize_guardrail(linten_params: "LintenParams", guardrail: "Guardrail"):
    import linten
    
    _my_guardrail_callback = MyGuardrail(
        api_base=linten_params.api_base,
        api_key=linten_params.api_key,
        guardrail_name=guardrail.get("guardrail_name", ""),
        event_hook=linten_params.mode,
        default_on=linten_params.default_on,
    )
    
    linten.logging_callback_manager.add_linten_callback(_my_guardrail_callback)
    return _my_guardrail_callback


guardrail_initializer_registry = {
    SupportedGuardrailIntegrations.MY_GUARDRAIL.value: initialize_guardrail,
}

guardrail_class_registry = {
    SupportedGuardrailIntegrations.MY_GUARDRAIL.value: MyGuardrail,
}
```

### Register Your Guardrail Type

Add to `linten/types/guardrails.py`:

```python
class SupportedGuardrailIntegrations(str, Enum):
    LAKERA = "lakera_prompt_injection"
    APORIA = "aporia"
    BEDROCK = "bedrock_guardrails"
    PRESIDIO = "presidio"
    ZSCALER_AI_GUARD = "zscaler_ai_guard"
    MY_GUARDRAIL = "my_guardrail"
```

## Usage

### Config File

```yaml
model_list:
  - model_name: {{openai_large}}
    linten_params:
      model: {{openai_large}}
    api_key: os.environ/OPENAI_API_KEY

guardrails:
    - guardrail_name: my_guardrail
      linten_params:
        guardrail: my_guardrail
        mode: during_call
        api_key: os.environ/MY_GUARDRAIL_API_KEY
        api_base: https://api.myguardrail.com
```

### Per-Request

```bash
curl --location 'http://localhost:4000/chat/completions' \
--header "Authorization: Bearer $LINTEN_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Test message"}],
    "guardrails": ["my_guardrail"]
}'
```

## Testing

Add unit tests inside `test_linten/` folder.



