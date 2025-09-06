- **Priority**: P2 (High)
- **Estimate**: S (3-5 days)
- **Type**: Research & Prototyping (`spike`)
- **Description**: Research and evaluate technical solutions for verifying off-chain fiat reserves, a critical component of the Treasury & Reserve Attestation module. The goal is to identify potential partners, understand API capabilities, and create a small proof-of-concept.
- **AI-Friendly Instructions**:
  - **Goal**: Determine the most viable method for a regulated token issuer to prove their USD reserves held in a bank account to our platform in an automated and cryptographically secure manner.
  - **Areas of Research**:
    1.  **Financial Data Aggregators**:
        - Investigate **Plaid**, **Teller**, and **Stripe** APIs.
        - **Questions to Answer**:
          - Can their APIs provide daily/real-time account balance statements?
          - What is the structure of the data they return? (e.g., JSON with account holder, balance, timestamp)
          - What are their authentication and security models? (OAuth, API keys)
          - Do they have a concept of "certified" or "attested" data suitable for audits?
          - What are their pricing models and terms of service for this type of use case?
    2.  **Qualified Custodian Partnerships**:
        - Research regulated financial institutions that act as "qualified custodians" (e.g., Anchorage Digital, BitGo, traditional banks with digital asset services like BNY Mellon).
        - **Questions to Answer**:
          - Do they offer APIs for balance reporting?
          - Would they be willing to act as an "oracle" that signs a message attesting to a client's balance at a specific time? (e.g., `sign("Client XYZ held $100,000,000 USD at 2025-02-08T00:00:00Z")`)
          - What are the legal and operational requirements to establish such a partnership?
    3.  **Proof-of-Concept (POC)**:
        - Based on the research, create a small NestJS service (`fiat-reserve-verifier.service.ts`).
        - This service should have a mock function that simulates fetching data from a provider (e.g., Plaid).
        - It should then create a JSON object representing a "Reserve Attestation" and log it.
        - **Example Attestation Object**:
          ```json
          {
            "issuerId": "client-abc",
            "asset": "USD",
            "assetType": "FIAT",
            "custodian": "Bank of Example (via Plaid)",
            "balance": "100000000.00",
            "timestamp": "2025-02-08T00:00:00Z",
            "providerDataHash": "sha256_hash_of_raw_plaid_response"
          }
          ```
- **Acceptance Criteria**:
  - [ ] A written summary comparing at least two data aggregators and one custodian model is produced.
  - [ ] The summary includes an analysis of technical feasibility, security, and potential costs.
  - [ ] A recommendation is made for the most promising approach for our MVP.
  - [ ] A `fiat-reserve-verifier.service.ts` file is created with a functioning mock proof-of-concept as described above.
- **Success Metrics**:
  - A clear, actionable path forward for building the fiat reserve verification feature is defined. 