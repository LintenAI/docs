import Image from '@theme/IdealImage';

# Slack

<Image img={require('../../img/slack.png')} />

:::info
We want to learn how we can make the callbacks better! Meet the Linten [founders](https://calendly.com/d/4mp-gd3-k5k/lintenai-1-1-onboarding-linten-hosted-version) or
join our [discord](https://discord.gg/wuPM9dRgDw)
::: 

## Pre-Requisites

### Step 1
```shell
uv add linten
```

### Step 2
Get a slack webhook url from https://api.slack.com/messaging/webhooks



## Quick Start
### Create a custom Callback to log to slack
We create a custom callback, to log to slack webhooks, see [custom callbacks on linten](https://docs.linten.ai/docs/observability/custom_callback)
```python
def send_slack_alert(
        kwargs,
        completion_response,
        start_time,
        end_time,
):
    print(
        "in custom slack callback func"
    )
    import requests
    import json

    # Define the Slack webhook URL
    # get it from https://api.slack.com/messaging/webhooks
    slack_webhook_url = os.environ['SLACK_WEBHOOK_URL']   # "https://hooks.slack.com/services/<>/<>/<>"

    # Remove api_key from kwargs under linten_params
    if kwargs.get('linten_params'):
        kwargs['linten_params'].pop('api_key', None)
        if kwargs['linten_params'].get('metadata'):
            kwargs['linten_params']['metadata'].pop('deployment', None)
    # Remove deployment under metadata
    if kwargs.get('metadata'):
        kwargs['metadata'].pop('deployment', None)
    # Prevent api_key from being logged
    if kwargs.get('api_key'):
        kwargs.pop('api_key', None)

    # Define the text payload, send data available in linten custom_callbacks
    text_payload = f"""Linten Logging: kwargs: {str(kwargs)}\n\n, response: {str(completion_response)}\n\n, start time{str(start_time)} end time: {str(end_time)}
    """
    payload = {
        "text": text_payload
    }

    # Set the headers
    headers = {
        "Content-type": "application/json"
    }

    # Make the POST request
    response = requests.post(slack_webhook_url, json=payload, headers=headers)

    # Check the response status
    if response.status_code == 200:
        print("Message sent successfully to Slack!")
    else:
        print(f"Failed to send message to Slack. Status code: {response.status_code}")
        print(response.json())
```

### Pass callback to Linten
```python
linten.success_callback = [send_slack_alert]
```

```python
import linten
linten.success_callback = [send_slack_alert] # log success
linten.failure_callback = [send_slack_alert] # log exceptions

# this will raise an exception
response = linten.completion(
    model="gpt-2",
    messages=[
        {
            "role": "user",
            "content": "Hi - i'm openai"
        }
    ]
)
```
## Support & Talk to Founders

- [Schedule Demo](https://calendly.com/d/4mp-gd3-k5k/lintenai-1-1-onboarding-linten-hosted-version)
- [Community Discord](https://discord.gg/wuPM9dRgDw)
- Our emails ishaan@berri.ai / krrish@berri.ai
