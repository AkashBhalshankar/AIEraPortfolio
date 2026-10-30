import Reveal from './Reveal';
import { useState, useEffect } from 'react';

const SKILLS = [
  { group: 'AI / LLM Orchestration', items: ['LangGraph', 'LangChain', 'LLM', 'RAG', 'FAISS', 'Azure OpenAI', 'Azure AI Foundry'] },
  { group: 'Programming & Frameworks', items: ['Python', 'Java', 'FastAPI', 'Pydantic'] },
  { group: 'Cloud & Enterprise Identity', items: ['Azure OpenAI Service', 'Microsoft Entra ID', 'Microsoft Graph', 'Azure Blob Storage', 'Azure Container Apps'] },
  { group: 'Databases, Tools & Methodologies', items: ['SQL', 'MySQL', 'SQLite', 'GitHub Copilot', 'Selenium', 'Git', 'Agile & Scrum'] },
];

const EVIDENCE = {
  'LangGraph': { cat: 'AI / LLM Orchestration', ev: 'Delivered 5–7 enterprise applications onto a LangGraph-based multi-agent foundation with a reflection agent that reviews outputs and proceeds without manual intervention.', where: 'UBS Request Management Service' },
  'LangChain': { cat: 'AI / LLM Orchestration', ev: 'Built modular LLM workflows and tool integrations using LangChain for enterprise use cases.', where: 'UBS AI Services' },
  'LLM': { cat: 'AI / LLM Orchestration', ev: 'Applied large language models to automate document parsing and intelligent summarization.', where: 'UBS & Portfolio Projects' },
  'RAG': { cat: 'AI / LLM Orchestration', ev: 'Implemented retrieval-augmented generation to ground answers in internal knowledge bases.', where: 'UBS Knowledge Assistant' },
  'FAISS': { cat: 'AI / LLM Orchestration', ev: 'Indexed agronomic and crop recommendation knowledge into FAISS for rapid semantic similarity search.', where: 'AgriMentor Vector Store' },
  'Azure OpenAI': { cat: 'AI / LLM Orchestration', ev: 'Integrated Azure OpenAI models with secure enterprise deployments.', where: 'UBS AI Platform' },
  'Azure AI Foundry': { cat: 'AI / LLM Orchestration', ev: 'Deployed and managed AI solutions on Azure AI Foundry.', where: 'UBS AI Platform' },
  'Python': { cat: 'Programming & Frameworks', ev: 'Developed backend services, data pipelines, and AI utilities in Python.', where: 'UBS Services & AgriMentor' },
  'Java': { cat: 'Programming & Frameworks', ev: 'Built enterprise-grade Java modules with clean architecture.', where: 'Enterprise Projects' },
  'FastAPI': { cat: 'Programming & Frameworks', ev: 'Built asynchronous REST and WebSocket backends in FastAPI processing multimodal PDF/image/text inputs.', where: 'AgriMentor, Chikki & UBS Services' },
  'Pydantic': { cat: 'Programming & Frameworks', ev: 'Enforced strict schema validation and type-safe configurations using Pydantic.', where: 'UBS API Services' },
  'Azure OpenAI Service': { cat: 'Cloud & Enterprise Identity', ev: 'Provisioned and consumed Azure OpenAI Service endpoints in production.', where: 'UBS AI Platform' },
  'Microsoft Entra ID': { cat: 'Cloud & Enterprise Identity', ev: 'Contributed the authentication module using Microsoft Entra ID for enterprise identity verification.', where: 'UBS Provisioning Accelerator' },
  'Microsoft Graph': { cat: 'Cloud & Enterprise Identity', ev: 'Integrated Microsoft Graph APIs for secure enterprise data access.', where: 'UBS Internal Tools' },
  'Azure Blob Storage': { cat: 'Cloud & Enterprise Identity', ev: 'Implemented secure file uploads and retrievals using Azure Blob Storage.', where: 'UBS Document Services' },
  'Azure Container Apps': { cat: 'Cloud & Enterprise Identity', ev: 'Deployed containerized microservices to Azure Container Apps with scalable configurations.', where: 'UBS Microservices Platform' },
  'SQL': { cat: 'Databases, Tools & Methodologies', ev: 'Optimized complex SQL queries for high-performance data retrieval.', where: 'UBS Data Services' },
  'MySQL': { cat: 'Databases, Tools & Methodologies', ev: 'Designed relational schemas and managed MySQL databases.', where: 'Portfolio & Enterprise Projects' },
  'SQLite': { cat: 'Databases, Tools & Methodologies', ev: 'Used SQLite for lightweight, embedded data storage needs.', where: 'Chikki & Local Services' },
  'GitHub Copilot': { cat: 'Databases, Tools & Methodologies', ev: 'Leveraged GitHub Copilot to accelerate development with AI-assisted coding.', where: 'Daily Development' },
  'Selenium': { cat: 'Databases, Tools & Methodologies', ev: 'Automated end-to-end UI testing using Selenium.', where: 'QA Automation Suite' },
  'Git': { cat: 'Databases, Tools & Methodologies', ev: 'Managed version control and collaborative workflows using Git.', where: 'All Projects' },
  'Agile & Scrum': { cat: 'Databases, Tools & Methodologies', ev: 'Followed Agile/Scrum methodologies for iterative, sprint-based delivery.', where: 'UBS & Team Projects' },
};

export default function SkillsMatrix({ certifications = [], education = [], leadership = [] }) {
  const [tab, setTab] = useState('all');
  const [active, setActive] = useState('LangGraph');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const tabs = ['all', ...SKILLS.map((g) => g.group)];
  const visible = tab === 'all' ? SKILLS : SKILLS.filter((g) => g.group === tab);
  const info = active ? EVIDENCE[active] : null;

  return (
    <section id="skills-matrix">
      <div className="wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0 }}>Verified Technical Arsenal</h2>
            <p style={{ color: 'var(--muted)', margin: '4px 0 0', fontSize: '.95rem' }}>Context-Linked Skills Matrix</p>
          </div>
          <div className="filters" role="tablist">
            {tabs.map((t) => (
              <button key={t} className="f" aria-pressed={tab === t} onClick={() => setTab(t)}>
                {t === 'all' ? 'Reset / Show All' : t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: 24, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 18 }}>
              {visible.slice(0, 2).map((g) => (
                <div className="panel themed" key={g.group}>
                  <h3>{g.group}</h3>
                  <div className="tags" style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {g.items.map((item) => (
                      <button
                        key={item}
                        className={`tag${active === item ? ' hit' : ''}`}
                        onClick={() => setActive(item)}
                        aria-pressed={active === item}
                        style={{ cursor: 'pointer', transform: active === item ? 'translateY(-2px)' : 'none' }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 18, marginTop: 18 }}>
              {visible.slice(2, 4).map((g) => (
                <div className="panel themed" key={g.group}>
                  <h3>{g.group}</h3>
                  <div className="tags" style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {g.items.map((item) => (
                      <button
                        key={item}
                        className={`tag${active === item ? ' hit' : ''}`}
                        onClick={() => setActive(item)}
                        aria-pressed={active === item}
                        style={{ cursor: 'pointer', transform: active === item ? 'translateY(-2px)' : 'none' }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {isMobile && active && (
              <div className="panel themed" style={{ marginTop: 18 }}>
                <h3>Live Evidence Spotlight</h3>
                <div style={{ margin: '12px 0 10px', borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
                  <div style={{ fontSize: '.78rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{info?.cat || ''}</div>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.6rem', marginTop: 4 }}>{active}</div>
                </div>
                <div>
                  <div style={{ fontSize: '.8rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>Production Evidence &amp; Implementation</div>
                  <p style={{ margin: 0 }}>{info?.ev || 'Applied in professional work.'}</p>
                </div>
                <div style={{ marginTop: 14, padding: 12, background: 'var(--surface)', borderRadius: 12 }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Where Used</div>
                  <div style={{ marginTop: 4, fontWeight: 600 }}>{info?.where || '—'}</div>
                </div>
              </div>
            )}
          </div>

          {!isMobile && (
            <div className="panel themed" style={{ position: 'sticky', top: 90 }}>
              <h3>Live Evidence Spotlight</h3>
              {!active ? (
                <p style={{ color: 'var(--muted)' }}>Select a skill from the matrix to view production evidence and professional project applications.</p>
              ) : (
                <>
                  <div style={{ margin: '12px 0 10px', borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
                    <div style={{ fontSize: '.78rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{info?.cat || ''}</div>
                    <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.6rem', marginTop: 4 }}>{active}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '.8rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>Production Evidence &amp; Implementation</div>
                    <p style={{ margin: 0 }}>{info?.ev || 'Applied in professional work.'}</p>
                  </div>
                  <div style={{ marginTop: 14, padding: 12, background: 'var(--surface)', borderRadius: 12 }}>
                    <div style={{ fontSize: '.78rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Where Used</div>
                    <div style={{ marginTop: 4, fontWeight: 600 }}>{info?.where || '—'}</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <Reveal className="cred-grid" style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
          <div className="panel themed">
            <h3>Education</h3>
            {education.map((e) => (
              <div className="cert" key={e.degree}>
                <span className="seal">{e.code}</span>
                <div><b>{e.degree}</b><br /><small>{e.school} · {e.year}{e.score ? ` · ${e.score}` : ''}</small></div>
              </div>
            ))}
          </div>
          <div className="panel themed">
            <h3>Certifications</h3>
            {certifications.map((c) => (
              <div className="cert" key={c.name}>
                <span className="seal">{c.code}</span>
                <div><b>{c.name}</b><br /><small>{c.issuer}</small></div>
              </div>
            ))}
          </div>
          <div className="panel themed">
            <h3>Leadership</h3>
            {leadership.map((l) => (
              <div className="out" key={l.title}><b>{l.title}</b><span>{l.detail}</span></div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
