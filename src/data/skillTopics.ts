export interface SkillTopic {
  level_number: number;
  topic: string;
}

export const SKILL_TOPICS_MAP: Record<number, SkillTopic[]> = {
  // 1: Data Structures & Algorithms
  1: [
    { level_number: 1, topic: "Time & Space Complexity analysis (Big-O notation)" },
    { level_number: 2, topic: "Arrays, String manipulation & two-pointer techniques" },
    { level_number: 3, topic: "Singly & Doubly Linked Lists implementation" },
    { level_number: 4, topic: "Stacks, Queues & Monotonic stack algorithms" },
    { level_number: 5, topic: "Hash Maps, Sets & Collision resolution strategies" },
    { level_number: 6, topic: "Binary Trees, BST traversals & LCA algorithms" },
    { level_number: 7, topic: "Heaps, Priority Queues & Greedy choice strategies" },
    { level_number: 8, topic: "Graphs: BFS, DFS, Dijkstra, Union-Find & Topological Sort" },
    { level_number: 9, topic: "Dynamic Programming: 1D/2D memoization & tabulations" },
    { level_number: 10, topic: "Advanced: Trie, Segment Trees, Bitmask DP & optimization" },
  ],

  // 2: Object-Oriented Programming
  2: [
    { level_number: 1, topic: "Core OOP pillars: Encapsulation, Abstraction, Inheritance" },
    { level_number: 2, topic: "Polymorphism: method overloading and overriding" },
    { level_number: 3, topic: "Classes, Objects, Constructors & Access specifiers" },
    { level_number: 4, topic: "Abstract classes vs Interfaces and default methods" },
    { level_number: 5, topic: "SOLID Design Principles: Single Responsibility & Open/Closed" },
    { level_number: 6, topic: "Liskov Substitution, Interface Segregation & Dependency Inversion" },
    { level_number: 7, topic: "Creational Patterns: Singleton, Factory Method & Builder" },
    { level_number: 8, topic: "Structural & Behavioral Patterns: Observer, Strategy, Decorator" },
    { level_number: 9, topic: "Composition over inheritance & enterprise domain modeling" },
    { level_number: 10, topic: "Clean Code architecture, refactoring & anti-pattern detection" },
  ],

  // 3: SQL & Databases
  3: [
    { level_number: 1, topic: "Relational DB concepts, tables, primary & foreign keys" },
    { level_number: 2, topic: "Basic SQL queries: SELECT, WHERE, ORDER BY, GROUP BY" },
    { level_number: 3, topic: "SQL Joins: INNER, LEFT, RIGHT, FULL OUTER & CROSS joins" },
    { level_number: 4, topic: "Aggregate functions, HAVING clauses & subqueries" },
    { level_number: 5, topic: "Database Normalization (1NF, 2NF, 3NF, BCNF)" },
    { level_number: 6, topic: "Window functions (ROW_NUMBER, RANK, LEAD, LAG) & CTEs" },
    { level_number: 7, topic: "Indexes (B-Tree, Hash), Query Execution Plans & optimization" },
    { level_number: 8, topic: "ACID properties, Transactions, Isolation levels & Concurrency" },
    { level_number: 9, topic: "Stored procedures, triggers, views & database migrations" },
    { level_number: 10, topic: "Sharding, Read Replicas, NoSQL tradeoffs & distributed databases" },
  ],

  // 4: Cloud Fundamentals (AWS/Azure)
  4: [
    { level_number: 1, topic: "Cloud computing models: IaaS, PaaS, SaaS & Shared Responsibility" },
    { level_number: 2, topic: "Compute basics: Virtual Machines (AWS EC2 / Azure VMs)" },
    { level_number: 3, topic: "Cloud storage: Object storage (S3/Blob) & Block storage" },
    { level_number: 4, topic: "Networking: VPC/VNet, Subnets, Route Tables & Security Groups" },
    { level_number: 5, topic: "Identity & Access Management (IAM): roles, policies & MFA" },
    { level_number: 6, topic: "Managed relational & NoSQL databases in the cloud" },
    { level_number: 7, topic: "Serverless computing: AWS Lambda / Azure Functions basics" },
    { level_number: 8, topic: "Load Balancing, Auto Scaling & High Availability architectures" },
    { level_number: 9, topic: "Monitoring & logging: CloudWatch/Azure Monitor & Cost control" },
    { level_number: 10, topic: "Cloud security compliance, multi-region failover & hybrid architectures" },
  ],

  // 5: Operating Systems
  5: [
    { level_number: 1, topic: "OS functions: kernel vs user space, system calls architecture" },
    { level_number: 2, topic: "Process management, process states & Process Control Block (PCB)" },
    { level_number: 3, topic: "Threads, concurrency models, user vs kernel threads" },
    { level_number: 4, topic: "CPU scheduling algorithms: FCFS, SJF, Round Robin & Priority" },
    { level_number: 5, topic: "Inter-Process Communication (IPC): Pipes, Sockets & Shared Memory" },
    { level_number: 6, topic: "Process Synchronization: Mutex, Semaphores & Critical Section" },
    { level_number: 7, topic: "Deadlocks: Prevention, Avoidance (Banker's) & Detection" },
    { level_number: 8, topic: "Memory Management: Paging, Segmentation & Page Replacement" },
    { level_number: 9, topic: "Virtual Memory, Thrashing & File System inode structures" },
    { level_number: 10, topic: "I/O systems, disk scheduling & modern Linux kernel internals" },
  ],

  // 6: Computer Networks
  6: [
    { level_number: 1, topic: "OSI 7-layer & TCP/IP 4-layer networking models" },
    { level_number: 2, topic: "Physical & Data Link layers: MAC address, Ethernet, ARP" },
    { level_number: 3, topic: "Network Layer: IPv4, IPv6, Subnetting & CIDR calculations" },
    { level_number: 4, topic: "Routing protocols: Distance Vector vs Link State basics" },
    { level_number: 5, topic: "Transport Layer: TCP vs UDP, 3-way handshake & connection termination" },
    { level_number: 6, topic: "TCP Flow Control, Congestion Control & Windowing mechanisms" },
    { level_number: 7, topic: "Application protocols: HTTP/1.1 vs HTTP/2 vs HTTP/3, DNS lookup" },
    { level_number: 8, topic: "Network Security: SSL/TLS handshake, HTTPS & Firewalls" },
    { level_number: 9, topic: "Websockets, CDNs, Reverse Proxies & NAT configurations" },
    { level_number: 10, topic: "Software-defined networking, Zero Trust & Edge network routing" },
  ],

  // 7: Aptitude & Logical Reasoning
  7: [
    { level_number: 1, topic: "Speed Math, percentages, fractions & ratio proportions" },
    { level_number: 2, topic: "Profit & Loss, Simple and Compound Interest calculations" },
    { level_number: 3, topic: "Time, Speed & Distance: trains, boats & relative speed" },
    { level_number: 4, topic: "Time & Work, Pipes & Cisterns, Unitary method concepts" },
    { level_number: 5, topic: "Permutations, Combinations & probability distributions" },
    { level_number: 6, topic: "Number series, analogies, coding-decoding & letter sequences" },
    { level_number: 7, topic: "Blood relations, direction sense & seating arrangements" },
    { level_number: 8, topic: "Syllogisms, statement-assumptions & logical deductions" },
    { level_number: 9, topic: "Data Interpretation: Bar graphs, Pie charts & Line plots" },
    { level_number: 10, topic: "Advanced Critical Reasoning, Data Sufficiency & Complex puzzles" },
  ],

  // 8: Communication & Behavioral
  8: [
    { level_number: 1, topic: "Clear verbal articulation & structured professional greetings" },
    { level_number: 2, topic: "Active listening skills & comprehension verification" },
    { level_number: 3, topic: "STAR method formulation for storytelling & personal projects" },
    { level_number: 4, topic: "Professional email etiquette & technical status reporting" },
    { level_number: 5, topic: "Handling conflict, constructive feedback & emotional quotient" },
    { level_number: 6, topic: "Cross-functional team collaboration & stakeholder communication" },
    { level_number: 7, topic: "Persuasive technical presentations & audience calibration" },
    { level_number: 8, topic: "Executive presence, negotiation skills & project defense" },
    { level_number: 9, topic: "Crisis communication, accountability & leadership clarity" },
    { level_number: 10, topic: "Strategic influence, mentoring & global team collaboration" },
  ],

  // 9: Web Development Basics
  9: [
    { level_number: 1, topic: "Semantic HTML5 structure, accessibility & SEO basics" },
    { level_number: 2, topic: "CSS3 Flexbox, Grid layouts & responsive media queries" },
    { level_number: 3, topic: "JavaScript fundamentals: variables, scoping, ES6+ syntax" },
    { level_number: 4, topic: "DOM manipulation, event delegation & browser APIs" },
    { level_number: 5, topic: "Asynchronous JS: Promises, async/await & Fetch API" },
    { level_number: 6, topic: "Modern frontend frameworks: React component lifecycle & hooks" },
    { level_number: 7, topic: "State management, form validation & client-side routing" },
    { level_number: 8, topic: "RESTful API integration, CORS & Web storage mechanisms" },
    { level_number: 9, topic: "Web performance optimization: lazy loading, bundle splitting" },
    { level_number: 10, topic: "Frontend security: XSS, CSRF mitigation & CSP headers" },
  ],

  // 10: System Design (Intro)
  10: [
    { level_number: 1, topic: "Client-Server architecture, monoliths vs microservices basics" },
    { level_number: 2, topic: "Horizontal vs Vertical scaling & stateless application design" },
    { level_number: 3, topic: "Load Balancers: Round-robin, least connections, L4 vs L7" },
    { level_number: 4, topic: "Caching strategies: Cache-Aside, Write-Through, Redis/Memcached" },
    { level_number: 5, topic: "Database replication, read-write splitting & sharding basics" },
    { level_number: 6, topic: "CAP Theorem, PACELC theorem & consistency trade-offs" },
    { level_number: 7, topic: "Message Queues & Asynchronous processing: Kafka/RabbitMQ" },
    { level_number: 8, topic: "Designing a URL Shortener (Bitly) step-by-step" },
    { level_number: 9, topic: "Rate limiting algorithms: Token Bucket, Leaky Bucket" },
    { level_number: 10, topic: "Designing scalable notifications & real-time chat architecture" },
  ],

  // 11: Git & Version Control
  11: [
    { level_number: 1, topic: "Version control concepts, git init, clone, status & gitignore" },
    { level_number: 2, topic: "Staging, committing, diff inspection & commit message hygiene" },
    { level_number: 3, topic: "Branching strategies: branch, checkout, switch & merge" },
    { level_number: 4, topic: "Remote repositories: push, pull, fetch & upstream tracking" },
    { level_number: 5, topic: "Resolving merge conflicts & using git merge tools" },
    { level_number: 6, topic: "Git stash, cherry-pick, reset vs revert mechanisms" },
    { level_number: 7, topic: "Interactive rebase (git rebase -i), squash & commit cleanup" },
    { level_number: 8, topic: "Git branching workflows: GitFlow, Trunk-Based Development" },
    { level_number: 9, topic: "Pull Request review workflows, code reviews & branch protection" },
    { level_number: 10, topic: "Git bisect debugging, reflog recovery & CI/CD webhook triggers" },
  ],

  // 12: Generative AI Basics
  12: [
    { level_number: 1, topic: "AI vs ML vs Deep Learning vs Generative AI definitions" },
    { level_number: 2, topic: "Transformer architecture fundamentals & self-attention mechanism" },
    { level_number: 3, topic: "Large Language Models (LLMs): tokens, context windows & greedy decoding" },
    { level_number: 4, topic: "Prompt engineering techniques: zero-shot, few-shot, CoT" },
    { level_number: 5, topic: "LLM parameters: temperature, top-p, frequency penalties" },
    { level_number: 6, topic: "Embeddings, vector representations & cosine similarity metrics" },
    { level_number: 7, topic: "Retrieval-Augmented Generation (RAG) architecture basics" },
    { level_number: 8, topic: "Vector databases: indexing, semantic search & chunking tactics" },
    { level_number: 9, topic: "Fine-tuning vs RAG vs In-context learning tradeoffs" },
    { level_number: 10, topic: "AI safety, hallucination mitigation, guardrails & agentic workflows" },
  ],
};

export function getSkillTopics(skillSetId: number): SkillTopic[] {
  return (
    SKILL_TOPICS_MAP[skillSetId] || [
      { level_number: 1, topic: "Foundational concepts and principles" },
      { level_number: 2, topic: "Basic syntax, setup, and tooling" },
      { level_number: 3, topic: "Core language features and primitives" },
      { level_number: 4, topic: "Intermediate patterns and data handling" },
      { level_number: 5, topic: "Standard libraries and practical workflows" },
      { level_number: 6, topic: "Testing, debugging, and code hygiene" },
      { level_number: 7, topic: "Architectural patterns and best practices" },
      { level_number: 8, topic: "Performance tuning and optimization" },
      { level_number: 9, topic: "Enterprise integrations and security" },
      { level_number: 10, topic: "Expert systems and specialized domains" },
    ]
  );
}
