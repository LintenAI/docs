import Image from '@theme/IdealImage';

# Linten Proxy Performance

The numbers on this page compare the proxy against calling a provider directly. For gateway capacity numbers (requests, tokens, and latency per pod at scale) see [Benchmarks](../benchmarks.md).

### Throughput - 30% Increase
Linten proxy + Load Balancer gives **30% increase** in throughput compared to Raw OpenAI API
<Image img={require('../../img/throughput.png')} />

### Latency Added - 0.00325 seconds
Linten proxy adds **0.00325 seconds** latency as compared to using the Raw OpenAI API
<Image img={require('../../img/latency.png')} />