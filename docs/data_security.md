# Data Privacy and Security

At Linten, **safeguarding your data privacy and security** is our top priority. We recognize the critical importance of the data you share with us and handle it with the highest level of diligence.

## Security Measures

### Self-hosted Instances Linten

- **No data or telemetry is stored on Linten Servers when you self-host**, unless you point usage telemetry's HTTP endpoint at them as described below
- For installation and configuration, see: [Self-hosting guide](../docs/proxy/deploy.md)
- **Telemetry**: Usage telemetry is off by default when you self-host Linten. If you turn it on, it keeps aggregate counts in your own database or sends them to the HTTP endpoint you set. There is no default endpoint, so nothing reaches Linten servers unless you set one that points there. See [Usage telemetry](./proxy/telemetry.md) for every field it can collect

For security inquiries, please contact us at support@berri.ai

## Collection of Personal Data

### For Self-hosted Linten Users:
- No personal data is collected or transmitted to Linten servers when you self-host our software.
- Any data generated or processed remains entirely within your own infrastructure.

## Cookies Information, Security, and Privacy

### For Self-hosted Linten Users:
- Cookie data remains within your own infrastructure.
- Linten uses minimal cookies, solely for the purpose of allowing Proxy users to access the Linten Admin UI.
- These cookies are stored in your web browser after you log in.
- We do not use cookies for advertising, tracking, or any purpose beyond maintaining your login session.
- The only cookies used are essential for maintaining user authentication and session management for the app UI.
- Session cookies expire when you close your browser, logout or after 24 hours.
- Linten does not use any third-party cookies.
- The Admin UI accesses the cookie to authenticate your login session.
- The cookie is stored as JWT and is not accessible to any other part of the system.
- We (Linten) do not access or share this cookie data for any other purpose.

## Security Vulnerability Reporting Guidelines

We value the security community's role in protecting our systems and users.

The canonical vulnerability disclosure policy lives in [`security.md` in the Linten repository](https://github.com/LintenAI/linten/blob/main/security.md), which includes information about our bug bounty.

The preferred way to report a vulnerability is the [Linten vulnerability disclosure form](https://security.linten.ai/vdp). Reports submitted through the form go to the Linten program on HackerOne and are triaged there, and you do not need a HackerOne account to submit one. Please do not open a draft GitHub Security Advisory (GHSA) to report a vulnerability to us. If you cannot use the form, emailing [support@berri.ai](mailto:support@berri.ai) with the same details works in a pinch, though may be triaged more slowly.

Please note that in order to combat low-quality AI spam, all vulnerability reports require a video or screen recording of you demonstrating the full exploit.

## Vulnerability Scanning

- Linten runs [`grype`](https://github.com/anchore/grype) security scans on all built Docker images.
    - See [`grype linten` check on ci/cd](https://github.com/LintenAI/linten/blob/main/.circleci/config.yml#L1099). 
    - Current Status: ✅ Passing. 0 High/Critical severity vulnerabilities found.

## Legal/Compliance FAQs

### Procurement Options

1. Invoicing
2. AWS Marketplace
3. Azure Marketplace


### Vendor Information

Legal Entity Name: Berrie AI Incorporated

Point of contact email address for security incidents: krrish@berri.ai

Point of contact email address for general security-related questions: krrish@berri.ai 

Has the Vendor been audited / certified? 
- SOC 2 Type II. Our current report is available through the [Linten Trust Center](https://trust.linten.ai/).

Has an information security management system been implemented? 
- Yes - [CodeQL](https://codeql.github.com/) and an ISMS covering multiple security domains.

Is logging of key events - auth, creation, update changes occurring? 
- Yes - we have [audit logs](https://docs.linten.ai/docs/proxy/audit_logs#1-switch-on-audit-logs)

Does the Vendor have an established Cybersecurity incident management program? 
- Yes, Incident Response Policy available upon request.


Does the vendor have a vulnerability disclosure policy in place? [Yes](https://github.com/LintenAI/linten?tab=security-ov-file#security-vulnerability-reporting-guidelines)

Does the vendor perform vulnerability scans? 
- Yes, regular vulnerability scans are conducted as detailed in the [Vulnerability Scanning](#vulnerability-scanning) section.

Signer Name: Krish Amit Dholakia

Signer Email: krrish@berri.ai