import { useState, useEffect, useRef } from "react"
import {
  MessageSquare, FileText, Settings, Search, Upload, Mic, Send,
  Plus, Sparkles, Brain, Database, Clock, ChevronDown, Shield,
  GitBranch, BookOpen, ArrowRight, Layers, X
} from "lucide-react"

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #07090f;
    --surface: #0d1117;
    --card: #111827;
    --border: rgba(255,255,255,0.07);
    --cyan: #06b6d4;
    --cyan-dim: rgba(6,182,212,0.12);
    --purple: #8b5cf6;
    --purple-dim: rgba(139,92,246,0.12);
    --green: #10b981;
    --amber: #f59e0b;
    --text: #e2e8f0;
    --text-2: #94a3b8;
    --text-3: #64748b;
    --text-4: #334155;
    --ff-display: 'Syne', sans-serif;
    --ff-mono: 'JetBrains Mono', monospace;
    --ff-body: 'Inter', sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--ff-body); overflow: hidden; }
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes glow  { 0%,100%{box-shadow:0 0 18px rgba(6,182,212,.2)} 50%{box-shadow:0 0 36px rgba(6,182,212,.45)} }
  @keyframes bounceUp { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-7px)} }
  @keyframes wave    { 0%,100%{height:3px} 50%{height:15px} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideR  { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes confBar { from{width:0} to{width:var(--w)} }

  .nav-btn        { transition:all .15s; }
  .nav-btn:hover  { background:rgba(255,255,255,.05)!important; }
  .nav-btn.on     { background:var(--cyan-dim)!important; color:var(--cyan)!important; }
  .chat-row       { transition:background .15s; }
  .chat-row:hover { background:rgba(255,255,255,.04)!important; cursor:pointer; }
  .chat-row.on    { background:rgba(255,255,255,.06)!important; }
  .src-card       { transition:border-color .2s,transform .2s; }
  .src-card:hover { border-color:rgba(6,182,212,.3)!important; transform:translateY(-1px); }
  .rtab           { transition:all .15s; }
  .rtab:hover     { color:var(--text-2)!important; }
  .rtab.on        { color:var(--cyan)!important; border-bottom:2px solid var(--cyan)!important; }
  .send-btn       { transition:all .2s; }
  .send-btn:hover:not(:disabled) { background:#0891b2!important; box-shadow:0 0 28px rgba(6,182,212,.55)!important; }
  .send-btn:active:not(:disabled){ transform:scale(.95); }
  .iarea:focus-within { border-color:rgba(6,182,212,.35)!important; box-shadow:0 0 0 1px rgba(6,182,212,.08),0 0 28px rgba(6,182,212,.06)!important; }
  .cite           { transition:background .15s; }
  .cite:hover     { background:rgba(6,182,212,.28)!important; cursor:pointer; }
  .kb-chip        { transition:all .15s; }
  .kb-chip:hover  { border-color:rgba(139,92,246,.4)!important; }
  .kb-chip.on     { background:var(--purple-dim)!important; border-color:var(--purple)!important; color:var(--purple)!important; }
  .drop-zone      { transition:all .2s; }
  .drop-zone:hover{ border-color:rgba(6,182,212,.4)!important; background:rgba(6,182,212,.03)!important; }
  .drop-zone.drag { border-color:var(--cyan)!important; background:rgba(6,182,212,.07)!important; animation:glow 1s ease infinite; }
  .icon-btn       { transition:all .15s; }
  .icon-btn:hover { background:rgba(255,255,255,.07)!important; color:var(--text-2)!important; }
  .cmd-item:hover { background:rgba(255,255,255,.06)!important; cursor:pointer; }
  .expand-btn     { transition:all .15s; }
  .expand-btn:hover { color:var(--cyan)!important; border-color:rgba(6,182,212,.25)!important; }
  .sug-btn        { transition:all .15s; }
  .sug-btn:hover  { border-color:rgba(6,182,212,.3)!important; color:var(--text-2)!important; }
`

const MSGS = [
  {
    id:1, role:'user', ts:'2:41 PM',
    content:'What are the key differences between FAISS and Pinecone for production RAG systems?'
  },
  {
    id:2, role:'ai', ts:'2:41 PM', conf:94,
    sources:[1,2,3],
    reasoning:['Retrieved 8 chunks from technical docs','Cross-encoder reranked to top 3','Synthesized comparison across sources','Grounded answer — no hallucination'],
    content:`Based on the indexed documentation, FAISS and Pinecone differ fundamentally in their deployment model and scaling characteristics.

**FAISS** [¹] is an in-memory library by Meta that excels at local, high-speed similarity search. It requires manual index management, persistence handling, and runs entirely within your infrastructure. Best for datasets under 10M vectors with predictable load.

**Pinecone** [²] is a fully managed vector database offering automatic scaling, real-time updates, and built-in metadata filtering. It abstracts infrastructure complexity at the cost of network latency and ongoing spend.

For your current stack [³], FAISS aligns well given the document-scale workload — though adding persistence (save/load index to disk) would close the main gap.`
  }
]

const SOURCES = [
  { id:1, title:'FAISS Documentation',       file:'faiss_technical_guide.pdf', page:12, conf:97, ts:'2 days ago',
    snippet:'FAISS operates entirely in-memory, providing sub-millisecond query times for datasets up to tens of millions of vectors...' },
  { id:2, title:'Pinecone Architecture Overview', file:'pinecone_overview.pdf', page:3,  conf:91, ts:'1 week ago',
    snippet:"Pinecone's serverless architecture automatically scales compute resources based on query volume and index size..." },
  { id:3, title:'RAG Production Patterns',    file:'rag_patterns_2024.pdf',    page:28, conf:88, ts:'3 days ago',
    snippet:'For production RAG systems with under 5M vectors, self-hosted FAISS with persistence offers the best cost/performance...' },
]

const MEMORY = [
  { id:1, icon:'🧠', text:'User is building a RAG system with FAISS + Groq',   ts:'This session' },
  { id:2, icon:'⚙️', text:'Project uses Streamlit + Python stack',              ts:'This session' },
  { id:3, icon:'📄', text:'Multi-PDF support recently implemented',             ts:'This session' },
  { id:4, icon:'✂️', text:'User prefers minimal, surgical code changes',        ts:'This session' },
]

const DOCS = [
  { name:'faiss_technical_guide.pdf', size:'2.4 MB', chunks:142, color:'#06b6d4' },
  { name:'pinecone_overview.pdf',     size:'1.1 MB', chunks:67,  color:'#8b5cf6' },
  { name:'rag_patterns_2024.pdf',     size:'3.8 MB', chunks:218, color:'#10b981' },
]

const CMD = [
  { icon:'💬', label:'New conversation',  key:'N' },
  { icon:'📄', label:'Upload document',   key:'U' },
  { icon:'🔍', label:'Search documents',  key:'F' },
  { icon:'🧠', label:'View memory',       key:'M' },
  { icon:'⚙️', label:'Open settings',    key:',' },
]

const glass = {
  background:'rgba(255,255,255,0.025)',
  border:'1px solid rgba(255,255,255,0.07)',
  backdropFilter:'blur(20px)',
}

export default function RAGInterface() {
  const [msgs, setMsgs]         = useState(MSGS)
  const [inp, setInp]           = useState('')
  const [rtab, setRtab]         = useState('sources')
  const [nav, setNav]           = useState('chat')
  const [streaming, setStream]  = useState(false)
  const [cmdOpen, setCmd]       = useState(false)
  const [rOpen, setROpen]       = useState(true)
  const [voice, setVoice]       = useState(false)
  const [drag, setDrag]         = useState(false)
  const [kb, setKb]             = useState('rag-docs')
  const [expanded, setExpanded] = useState(null)
  const endRef = useRef(null)

  useEffect(() => {
    const fn = e => {
      if ((e.metaKey||e.ctrlKey) && e.key==='k') { e.preventDefault(); setCmd(p=>!p) }
      if (e.key==='Escape') setCmd(false)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}) }, [msgs, streaming])

  const send = () => {
    if (!inp.trim() || streaming) return
    const um = { id:msgs.length+1, role:'user', ts: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}), content:inp }
    setMsgs(p=>[...p, um]); setInp(''); setStream(true)
    setTimeout(() => {
      setMsgs(p=>[...p,{
        id:p.length+1, role:'ai',
        ts:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
        conf:89, sources:[1,2],
        reasoning:['Rewrote query for semantic clarity','Retrieved top-5 via FAISS','Cross-encoder reranked','Built grounded context'],
        content:'Based on the indexed documents, I can address your question with high confidence. The retrieved chunks provide direct evidence supporting this answer, grounded entirely within your uploaded knowledge base.'
      }])
      setStream(false)
    }, 2000)
  }

  const parseContent = txt =>
    txt.replace(/\*\*(.*?)\*\*/g,'<strong style="color:#e2e8f0;font-weight:600">$1</strong>')
       .replace(/\[([¹²³\d]+)\]/g,'<span class="cite" style="display:inline-flex;align-items:center;padding:1px 6px;margin:0 2px;border-radius:4px;background:rgba(6,182,212,.12);border:1px solid rgba(6,182,212,.25);color:#06b6d4;font-size:10px;font-family:\'JetBrains Mono\',monospace;transition:background .15s">$1</span>')

  return (
    <div style={{display:'flex',height:'100vh',background:'#07090f',overflow:'hidden',position:'relative',fontFamily:'Inter,sans-serif'}}>
      <style>{GLOBAL_CSS}</style>

      {/* Grid bg */}
      <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0,
        backgroundImage:'linear-gradient(rgba(6,182,212,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,.025) 1px,transparent 1px)',
        backgroundSize:'44px 44px'}} />
      <div style={{position:'absolute',top:'-180px',left:'35%',width:'580px',height:'380px',
        background:'radial-gradient(ellipse,rgba(6,182,212,.07) 0%,transparent 68%)',
        pointerEvents:'none',zIndex:0}} />
      <div style={{position:'absolute',bottom:'-100px',right:'20%',width:'400px',height:'300px',
        background:'radial-gradient(ellipse,rgba(139,92,246,.05) 0%,transparent 68%)',
        pointerEvents:'none',zIndex:0}} />

      {/* ─── LEFT SIDEBAR ─── */}
      <aside style={{width:232,flexShrink:0,display:'flex',flexDirection:'column',
        borderRight:'1px solid rgba(255,255,255,0.06)',
        background:'rgba(7,9,15,0.85)',backdropFilter:'blur(24px)',zIndex:10}}>

        {/* Logo */}
        <div style={{padding:'18px 14px 14px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:34,height:34,borderRadius:9,
              background:'linear-gradient(135deg,#06b6d4,#8b5cf6)',
              display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:'0 0 22px rgba(6,182,212,.35)',
              fontSize:15,fontWeight:800,color:'#fff',fontFamily:'Syne,sans-serif'}}>R</div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:'#e2e8f0',fontFamily:'Syne,sans-serif',letterSpacing:'-.3px'}}>RAG Assistant</div>
              <div style={{fontSize:10,color:'#06b6d4',fontFamily:'JetBrains Mono,monospace',marginTop:1}}>v2.0 · multi-pdf</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{padding:'10px 8px',display:'flex',flexDirection:'column',gap:2}}>
          {[{id:'chat',icon:MessageSquare,label:'Conversations'},{id:'documents',icon:FileText,label:'Documents'},{id:'settings',icon:Settings,label:'Settings'}]
            .map(({id,icon:I,label})=>(
            <button key={id} className={`nav-btn${nav===id?' on':''}`} onClick={()=>setNav(id)}
              style={{display:'flex',alignItems:'center',gap:9,padding:'8px 11px',borderRadius:8,
                border:'none',cursor:'pointer',background:'transparent',
                color:nav===id?'#06b6d4':'#64748b',fontSize:13,fontWeight:500,width:'100%',fontFamily:'Inter,sans-serif'}}>
              <I size={14}/>{label}
            </button>
          ))}
        </div>

        {/* KB */}
        <div style={{padding:'6px 12px 10px'}}>
          <div style={{fontSize:10,color:'#475569',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600,marginBottom:7}}>Knowledge Base</div>
          {['rag-docs','ml-papers','codebase'].map(k=>(
            <button key={k} className={`kb-chip${kb===k?' on':''}`} onClick={()=>setKb(k)}
              style={{display:'flex',alignItems:'center',gap:6,width:'100%',padding:'6px 9px',borderRadius:6,
                border:'1px solid rgba(255,255,255,0.07)',background:'transparent',
                color:'#94a3b8',fontSize:12,cursor:'pointer',marginBottom:3,fontFamily:'Inter,sans-serif',textAlign:'left'}}>
              <Database size={10}/>{k}
            </button>
          ))}
        </div>

        {/* Recents */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{padding:'0 14px 7px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:10,color:'#475569',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600}}>Recent</span>
            <button style={{background:'none',border:'none',cursor:'pointer',color:'#475569',borderRadius:4,padding:2}}><Plus size={11}/></button>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'0 8px'}}>
            {['FAISS vs Pinecone comparison','Multi-PDF implementation','Query rewriting strategies','Hybrid search with BM25','RAG evaluation metrics']
              .map((c,i)=>(
              <div key={i} className={`chat-row${i===0?' on':''}`}
                style={{padding:'7px 10px',borderRadius:7,marginBottom:2,display:'flex',alignItems:'center',gap:7,
                  background:i===0?'rgba(255,255,255,.06)':'transparent'}}>
                <MessageSquare size={10} color="#475569" style={{flexShrink:0}}/>
                <span style={{fontSize:12,color:i===0?'#cbd5e1':'#64748b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ⌘K hint */}
        <div style={{padding:'10px 12px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          <button onClick={()=>setCmd(true)} style={{width:'100%',padding:'7px 10px',borderRadius:7,
            border:'1px solid rgba(255,255,255,0.07)',background:'rgba(255,255,255,.02)',
            color:'#475569',fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',fontFamily:'Inter,sans-serif'}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}><Search size={10}/><span>Command palette</span></div>
            <kbd style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'#334155',
              background:'rgba(255,255,255,.05)',padding:'2px 5px',borderRadius:3,border:'1px solid rgba(255,255,255,.08)'}}>⌘K</kbd>
          </button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative',zIndex:5}}>

        {/* Header */}
        <div style={{padding:'13px 22px',borderBottom:'1px solid rgba(255,255,255,0.06)',
          display:'flex',alignItems:'center',justifyContent:'space-between',
          background:'rgba(7,9,15,.7)',backdropFilter:'blur(20px)',flexShrink:0}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:'#e2e8f0',fontFamily:'Syne,sans-serif'}}>FAISS vs Pinecone comparison</div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:2}}>
              <span style={{fontSize:11,color:'#475569'}}>3 docs indexed</span>
              <span style={{width:3,height:3,borderRadius:'50%',background:'#334155'}}/>
              <span style={{fontSize:11,color:'#06b6d4',display:'flex',alignItems:'center',gap:5}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:'#06b6d4',display:'inline-block',animation:'pulse 2s ease infinite'}}/>
                rag-docs active
              </span>
            </div>
          </div>
          <button className="icon-btn" onClick={()=>setROpen(p=>!p)}
            style={{width:32,height:32,borderRadius:7,...glass,border:'1px solid rgba(255,255,255,.07)',
              cursor:'pointer',color:'#64748b',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Layers size={13}/>
          </button>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflowY:'auto',padding:'22px',display:'flex',flexDirection:'column',gap:20}}>
          {msgs.map((m,idx)=>(
            <div key={m.id} style={{display:'flex',flexDirection:'column',
              alignItems:m.role==='user'?'flex-end':'flex-start',
              animation:'fadeUp .3s ease both',animationDelay:`${idx*.05}s`}}>

              {m.role==='user' ? (
                <div style={{maxWidth:'62%',padding:'12px 16px',borderRadius:'16px 16px 4px 16px',
                  background:'linear-gradient(135deg,rgba(6,182,212,.14),rgba(139,92,246,.09))',
                  border:'1px solid rgba(6,182,212,.2)',color:'#e2e8f0',fontSize:14,lineHeight:1.65}}>
                  {m.content}
                  <div style={{fontSize:10,color:'#475569',marginTop:6,textAlign:'right'}}>{m.ts}</div>
                </div>
              ) : (
                <div style={{maxWidth:'76%',display:'flex',flexDirection:'column',gap:7}}>
                  {/* AI label */}
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:26,height:26,borderRadius:7,flexShrink:0,
                      background:'linear-gradient(135deg,#06b6d4,#8b5cf6)',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      boxShadow:'0 0 14px rgba(6,182,212,.3)'}}>
                      <Sparkles size={12} color="#fff"/>
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:'#94a3b8',fontFamily:'Syne,sans-serif'}}>RAG Assistant</span>
                    {m.conf&&(
                      <div style={{padding:'2px 8px',borderRadius:20,
                        background:m.conf>=90?'rgba(16,185,129,.1)':'rgba(245,158,11,.1)',
                        border:`1px solid ${m.conf>=90?'rgba(16,185,129,.3)':'rgba(245,158,11,.3)'}`,
                        fontSize:10,color:m.conf>=90?'#10b981':'#f59e0b',
                        display:'flex',alignItems:'center',gap:4,fontFamily:'JetBrains Mono,monospace'}}>
                        <Shield size={9}/>{m.conf}% confidence
                      </div>
                    )}
                  </div>

                  {/* Bubble */}
                  <div style={{padding:'14px 16px',borderRadius:'4px 16px 16px 16px',
                    background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',
                    color:'#cbd5e1',fontSize:14,lineHeight:1.72}}>
                    {m.content.split('\n\n').map((p,pi,arr)=>(
                      <p key={pi} style={{marginBottom:pi<arr.length-1?12:0}}
                        dangerouslySetInnerHTML={{__html:parseContent(p)}}/>
                    ))}

                    {m.reasoning&&(
                      <button className="expand-btn"
                        onClick={()=>setExpanded(expanded===m.id?null:m.id)}
                        style={{display:'flex',alignItems:'center',gap:6,marginTop:12,
                          padding:'5px 10px',borderRadius:6,border:'1px solid rgba(255,255,255,.07)',
                          background:'rgba(255,255,255,.02)',color:'#475569',fontSize:11,
                          cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                        <GitBranch size={11}/>How this was generated
                        <ChevronDown size={11} style={{transform:expanded===m.id?'rotate(180deg)':'rotate(0deg)',transition:'transform .2s'}}/>
                      </button>
                    )}

                    {expanded===m.id&&m.reasoning&&(
                      <div style={{marginTop:8,padding:'10px 12px',borderRadius:8,
                        background:'rgba(139,92,246,.05)',border:'1px solid rgba(139,92,246,.15)',
                        display:'flex',flexDirection:'column',gap:7}}>
                        {m.reasoning.map((step,si)=>(
                          <div key={si} style={{display:'flex',alignItems:'center',gap:9,
                            animation:'fadeUp .25s ease both',animationDelay:`${si*.07}s`}}>
                            <div style={{width:18,height:18,borderRadius:'50%',flexShrink:0,
                              background:'rgba(139,92,246,.18)',border:'1px solid rgba(139,92,246,.3)',
                              display:'flex',alignItems:'center',justifyContent:'center',
                              fontSize:9,color:'#8b5cf6',fontWeight:700}}>{si+1}</div>
                            <span style={{fontSize:11,color:'#94a3b8'}}>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{fontSize:10,color:'#2d3748',paddingLeft:4}}>{m.ts}</div>
                </div>
              )}
            </div>
          ))}

          {/* Streaming dots */}
          {streaming&&(
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:8,animation:'fadeIn .3s ease'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:26,height:26,borderRadius:7,
                  background:'linear-gradient(135deg,#06b6d4,#8b5cf6)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  animation:'glow 1s ease infinite'}}>
                  <Sparkles size={12} color="#fff"/>
                </div>
                <span style={{fontSize:12,fontWeight:700,color:'#94a3b8',fontFamily:'Syne,sans-serif'}}>Thinking…</span>
              </div>
              <div style={{padding:'13px 16px',borderRadius:'4px 16px 16px 16px',
                background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',
                display:'flex',alignItems:'center',gap:5}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:6,height:6,borderRadius:'50%',background:'#06b6d4',
                    animation:'bounceUp 1.2s ease infinite',animationDelay:`${i*.15}s`}}/>
                ))}
              </div>
            </div>
          )}
          <div ref={endRef}/>
        </div>

        {/* Input */}
        <div style={{padding:'14px 22px 18px',background:'rgba(7,9,15,.85)',
          backdropFilter:'blur(20px)',borderTop:'1px solid rgba(255,255,255,.06)',flexShrink:0}}>
          {/* Suggestions */}
          <div style={{display:'flex',gap:6,marginBottom:9,flexWrap:'wrap'}}>
            {['How to add persistence?','Compare retrieval methods','Optimize chunk size'].map((s,i)=>(
              <button key={i} className="sug-btn" onClick={()=>setInp(s)}
                style={{padding:'4px 10px',borderRadius:20,fontSize:11,
                  border:'1px solid rgba(255,255,255,.08)',background:'rgba(255,255,255,.02)',
                  color:'#64748b',cursor:'pointer',fontFamily:'Inter,sans-serif',
                  display:'flex',alignItems:'center',gap:5}}>
                <ArrowRight size={9}/>{s}
              </button>
            ))}
          </div>

          {/* Box */}
          <div className="iarea" style={{display:'flex',alignItems:'flex-end',gap:6,
            padding:'8px 8px 8px 14px',borderRadius:13,...glass,
            border:'1px solid rgba(255,255,255,.09)',transition:'all .2s'}}>
            <textarea value={inp} onChange={e=>setInp(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
              placeholder="Ask anything about your documents…" rows={1}
              style={{flex:1,background:'none',border:'none',outline:'none',
                color:'#e2e8f0',fontSize:14,lineHeight:1.5,resize:'none',
                fontFamily:'Inter,sans-serif',maxHeight:110,overflowY:'auto'}}/>
            <div style={{display:'flex',alignItems:'center',gap:3,flexShrink:0}}>
              {/* Voice */}
              <button className="icon-btn" onClick={()=>setVoice(p=>!p)}
                style={{width:32,height:32,borderRadius:8,border:'none',cursor:'pointer',
                  background:voice?'rgba(239,68,68,.12)':'transparent',
                  color:voice?'#ef4444':'#475569',
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                {voice?(
                  <div style={{display:'flex',alignItems:'center',gap:1.5}}>
                    {[1,2,3,2,1].map((h,i)=>(
                      <div key={i} style={{width:2.5,borderRadius:2,background:'#ef4444',
                        animation:'wave .6s ease infinite',animationDelay:`${i*.1}s`,height:h*4}}/>
                    ))}
                  </div>
                ):<Mic size={13}/>}
              </button>
              {/* Upload */}
              <button className="icon-btn"
                style={{width:32,height:32,borderRadius:8,border:'none',cursor:'pointer',
                  background:'transparent',color:'#475569',
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Upload size={13}/>
              </button>
              {/* Send */}
              <button className="send-btn" onClick={send} disabled={!inp.trim()||streaming}
                style={{width:34,height:34,borderRadius:9,border:'none',
                  cursor:inp.trim()&&!streaming?'pointer':'not-allowed',
                  background:inp.trim()&&!streaming?'#06b6d4':'#1e2736',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  boxShadow:inp.trim()?'0 0 20px rgba(6,182,212,.3)':'none'}}>
                <Send size={13} color={inp.trim()&&!streaming?'#fff':'#475569'}/>
              </button>
            </div>
          </div>
          <div style={{marginTop:7,fontSize:10,color:'#1e293b',textAlign:'center'}}>
            Grounded to indexed documents only ·&nbsp;
            <span style={{color:'#334155'}}>Shift+Enter</span> for newline ·&nbsp;
            <span style={{color:'#334155'}}>⌘K</span> for commands
          </div>
        </div>
      </main>

      {/* ─── RIGHT PANEL ─── */}
      {rOpen&&(
        <aside style={{width:292,flexShrink:0,display:'flex',flexDirection:'column',
          borderLeft:'1px solid rgba(255,255,255,.06)',
          background:'rgba(7,9,15,.75)',backdropFilter:'blur(24px)',
          zIndex:10,animation:'slideR .25s ease'}}>

          {/* Tabs */}
          <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,.06)',padding:'0 4px',flexShrink:0}}>
            {[{id:'sources',icon:BookOpen,label:'Sources'},{id:'memory',icon:Brain,label:'Memory'},{id:'docs',icon:FileText,label:'Docs'}]
              .map(({id,icon:I,label})=>(
              <button key={id} className={`rtab${rtab===id?' on':''}`} onClick={()=>setRtab(id)}
                style={{flex:1,padding:'11px 0',border:'none',background:'none',cursor:'pointer',
                  fontSize:12,fontWeight:500,
                  color:rtab===id?'#06b6d4':'#475569',
                  borderBottom:rtab===id?'2px solid #06b6d4':'2px solid transparent',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:5,fontFamily:'Inter,sans-serif'}}>
                <I size={11}/>{label}
              </button>
            ))}
          </div>

          <div style={{flex:1,overflowY:'auto',padding:'12px'}}>

            {/* SOURCES */}
            {rtab==='sources'&&(
              <div style={{display:'flex',flexDirection:'column',gap:9}}>
                <div style={{fontSize:10,color:'#475569',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600,padding:'4px 0'}}>
                  {SOURCES.length} sources retrieved
                </div>
                {SOURCES.map((s,i)=>(
                  <div key={s.id} className="src-card"
                    style={{padding:'12px',borderRadius:10,background:'rgba(255,255,255,.025)',
                      border:'1px solid rgba(255,255,255,.07)',
                      animation:'fadeUp .3s ease both',animationDelay:`${i*.08}s`}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:6}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:600,color:'#cbd5e1',marginBottom:2}}>{s.title}</div>
                        <div style={{fontSize:10,color:'#475569',fontFamily:'JetBrains Mono,monospace',display:'flex',gap:5}}>
                          <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:140}}>{s.file}</span>
                          <span>·</span><span>p.{s.page}</span>
                        </div>
                      </div>
                      <div style={{width:22,height:22,borderRadius:5,flexShrink:0,
                        background:'rgba(6,182,212,.1)',border:'1px solid rgba(6,182,212,.2)',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:9,color:'#06b6d4',fontWeight:700,fontFamily:'JetBrains Mono,monospace'}}>{i+1}</div>
                    </div>
                    <p style={{fontSize:11,color:'#64748b',lineHeight:1.5,marginBottom:9,
                      display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                      {s.snippet}
                    </p>
                    {/* Confidence */}
                    <div>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontSize:10,color:'#475569'}}>Relevance</span>
                        <span style={{fontSize:10,fontFamily:'JetBrains Mono,monospace',
                          color:s.conf>=90?'#10b981':'#f59e0b'}}>{s.conf}%</span>
                      </div>
                      <div style={{height:3,borderRadius:2,background:'rgba(255,255,255,.06)',overflow:'hidden'}}>
                        <div style={{height:'100%',borderRadius:2,width:`${s.conf}%`,
                          background:s.conf>=90?'linear-gradient(90deg,#06b6d4,#10b981)':'linear-gradient(90deg,#f59e0b,#ef4444)',
                          transition:'width 1s ease'}}/>
                      </div>
                    </div>
                    <div style={{marginTop:8,display:'flex',alignItems:'center',gap:4,color:'#334155',fontSize:10}}>
                      <Clock size={9}/>{s.ts}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MEMORY */}
            {rtab==='memory'&&(
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <div style={{fontSize:10,color:'#475569',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600,padding:'4px 0'}}>
                  Session context
                </div>
                {MEMORY.map((m,i)=>(
                  <div key={m.id}
                    style={{padding:'10px 12px',borderRadius:9,
                      background:'rgba(139,92,246,.04)',border:'1px solid rgba(139,92,246,.12)',
                      display:'flex',alignItems:'flex-start',gap:9,
                      animation:'fadeUp .25s ease both',animationDelay:`${i*.07}s`}}>
                    <span style={{fontSize:14,flexShrink:0,marginTop:1}}>{m.icon}</span>
                    <div>
                      <div style={{fontSize:12,color:'#94a3b8',lineHeight:1.45}}>{m.text}</div>
                      <div style={{fontSize:10,color:'#334155',marginTop:3}}>{m.ts}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DOCS */}
            {rtab==='docs'&&(
              <div style={{display:'flex',flexDirection:'column',gap:9}}>
                <div style={{fontSize:10,color:'#475569',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600,padding:'4px 0'}}>
                  {DOCS.length} documents indexed
                </div>
                {/* Drop zone */}
                <div className={`drop-zone${drag?' drag':''}`}
                  onDragOver={e=>{e.preventDefault();setDrag(true)}}
                  onDragLeave={()=>setDrag(false)}
                  onDrop={e=>{e.preventDefault();setDrag(false)}}
                  style={{border:'1.5px dashed rgba(255,255,255,.12)',borderRadius:10,
                    padding:'18px',textAlign:'center',cursor:'pointer'}}>
                  <Upload size={18} color="#475569" style={{marginBottom:6}}/>
                  <div style={{fontSize:11,color:'#64748b'}}>Drop PDFs here</div>
                  <div style={{fontSize:10,color:'#334155',marginTop:2}}>or click to browse</div>
                </div>
                {DOCS.map((d,i)=>(
                  <div key={i} style={{padding:'10px 12px',borderRadius:9,
                    background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.06)',
                    animation:'fadeUp .3s ease both',animationDelay:`${i*.07}s`}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}>
                      <div style={{width:30,height:30,borderRadius:7,flexShrink:0,
                        background:`${d.color}18`,border:`1px solid ${d.color}30`,
                        display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <FileText size={13} color={d.color}/>
                      </div>
                      <div style={{flex:1,overflow:'hidden'}}>
                        <div style={{fontSize:11,fontWeight:600,color:'#cbd5e1',
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.name}</div>
                        <div style={{fontSize:10,color:'#475569',fontFamily:'JetBrains Mono,monospace'}}>{d.size} · {d.chunks} chunks</div>
                      </div>
                    </div>
                    <div style={{padding:'2px 8px',borderRadius:20,display:'inline-flex',alignItems:'center',gap:5,
                      background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.2)',fontSize:9,color:'#10b981',fontWeight:600}}>
                      <span style={{width:4,height:4,borderRadius:'50%',background:'#10b981',display:'inline-block'}}/>indexed
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ─── COMMAND PALETTE ─── */}
      {cmdOpen&&(
        <div onClick={()=>setCmd(false)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',
            backdropFilter:'blur(10px)',zIndex:100,display:'flex',
            alignItems:'flex-start',justifyContent:'center',paddingTop:'14vh'}}>
          <div onClick={e=>e.stopPropagation()}
            style={{width:480,borderRadius:14,
              background:'rgba(10,12,18,.97)',border:'1px solid rgba(255,255,255,.12)',
              boxShadow:'0 28px 80px rgba(0,0,0,.7),0 0 0 1px rgba(6,182,212,.1)',
              animation:'fadeUp .18s ease',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'13px 15px',
              borderBottom:'1px solid rgba(255,255,255,.07)'}}>
              <Search size={15} color="#475569"/>
              <input autoFocus placeholder="Search commands, documents, chats…"
                style={{flex:1,background:'none',border:'none',outline:'none',
                  color:'#e2e8f0',fontSize:14,fontFamily:'Inter,sans-serif'}}/>
              <kbd style={{padding:'2px 6px',borderRadius:4,fontSize:10,fontFamily:'JetBrains Mono,monospace',
                background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.09)',color:'#475569'}}>ESC</kbd>
            </div>
            <div style={{padding:'5px'}}>
              {CMD.map((item,i)=>(
                <div key={i} className="cmd-item"
                  style={{display:'flex',alignItems:'center',gap:11,
                    padding:'9px 12px',borderRadius:8,transition:'all .1s'}}>
                  <span style={{fontSize:14}}>{item.icon}</span>
                  <span style={{flex:1,fontSize:13,color:'#cbd5e1',fontFamily:'Inter,sans-serif'}}>{item.label}</span>
                  <kbd style={{padding:'2px 7px',borderRadius:4,fontSize:10,fontFamily:'JetBrains Mono,monospace',
                    background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'#475569'}}>{item.key}</kbd>
                </div>
              ))}
            </div>
            <div style={{padding:'8px 15px',borderTop:'1px solid rgba(255,255,255,.06)',display:'flex',gap:14}}>
              {[['↑↓','navigate'],['↵','select'],['esc','close']].map(([k,l])=>(
                <div key={k} style={{display:'flex',alignItems:'center',gap:5,fontSize:10,color:'#334155'}}>
                  <kbd style={{padding:'2px 5px',borderRadius:3,fontFamily:'JetBrains Mono,monospace',
                    fontSize:9,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)'}}>{k}</kbd>{l}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
