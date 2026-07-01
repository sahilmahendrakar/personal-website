export interface Experience {
  id: string;
  title: string;
  company: string;
  companyUrl?: string;
  period: string;
  description: string;
  highlights?: string[];
  tags?: string[];
}

export const experiences: Experience[] = [
  {
    id: 'aws-sde',
    title: 'Software Development Engineer',
    company: 'Amazon Web Services',
    companyUrl: 'https://aws.amazon.com',
    period: 'Sept 2024 – Present',
    description: 'Building agentic AI on the Bedrock AgentCore team.',
    highlights: [
      'Building long-term memory for AI agents on Bedrock AgentCore Memory',
      'Previously delivered customer-facing cost optimization experiences (Compute Optimizer, Savings Plans, Cost Optimization Hub)',
    ],
    tags: ['Agentic AI', 'AWS', 'Bedrock AgentCore', 'TypeScript'],
  },
  {
    id: 'aws-intern',
    title: 'Software Development Engineer Intern',
    company: 'Amazon Web Services',
    companyUrl: 'https://aws.amazon.com',
    period: 'May – Aug 2023',
    description: 'Built SQL Server license optimization feature for AWS Compute Optimizer.',
    highlights: [
      'Developed rightsizing and edition downgrade recommendations for SQL Server workloads',
      'Enabled customers to reduce license costs by up to 73%',
      'Integrated with existing Compute Optimizer infrastructure',
    ],
    tags: ['Java', 'AWS', 'SQL Server'],
  },
  {
    id: 'ironmill',
    title: 'Co-founder & CTO',
    company: 'IronMill',
    period: 'Jun 2022 – Jan 2023',
    description: 'Led technical development for blockchain security startup.',
    highlights: [
      'Raised $1M pre-seed funding',
      'Selected for Stanford Blockchain Accelerator',
      'Awarded U.S. Patent 12,250,316 B2 for zero-knowledge proof system selection',
    ],
    tags: ['Blockchain', 'Cryptography', 'Python'],
  },
  {
    id: 'westlight',
    title: 'Cybersecurity Research Intern',
    company: 'Westlight AI',
    period: 'Summer 2020 & 2021',
    description: 'Conducted cybersecurity research contributing to federal contracts.',
    highlights: [
      'Contributed to USAF SBIR Phase I and Phase II awards',
      'Co-inventor on U.S. Patent 11,295,029 B1 for filesystem interception and encryption enforcement',
    ],
    tags: ['Cybersecurity', 'Research', 'Python'],
  },
];

export const education = {
  school: 'Columbia University',
  degree: 'Bachelor of Science in Computer Science',
  gpa: '4.12/4.0',
  period: '2020 – 2024',
};
