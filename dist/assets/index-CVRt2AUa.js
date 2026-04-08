import{a as n,j as e,r as q,f as K,R as J,L as Q,C as U,z as X}from"./index-Cqr79Mt5.js";import{u as V}from"./useTheme-BLQtSRBv.js";import{c as Z,I as ee}from"./index-XarWmt62.js";import{B as w}from"./button-Ce5oDx8t.js";import{R as G}from"./SearchOutlined-aOHgPhDG.js";import{E as W,a as te,s as x}from"./index-B9BwecOY.js";import{D as se}from"./index-wpNVnrpr.js";import{R as ae,F as ne}from"./ReloadOutlined-ebDYQ0En.js";import"./AntdIcon-UWCzxOJW.js";import"./LoadingOutlined-BRG3L3ka.js";import"./ResizeObserver.es-B1PUzC5B.js";import"./index-C1pd0Oqk.js";const ie=({visible:p,defaultSearch:S="",startTime:E="",endTime:I="",onClose:C,onConfirm:_})=>{const{isDark:R}=V(),[b,g]=n.useState(""),[N,$]=n.useState([]),[i,v]=n.useState(null),[P,k]=n.useState(!1),[r,T]=n.useState(!1),d=n.useRef(null),j=n.useRef(!1),B=()=>{if(E&&I)return{startTime:E,endTime:I};const a=new Date,f=`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")}`;return{startTime:`${f} 00:00:00`,endTime:`${f} 23:59:59`}},L=async(a=null)=>{var m,u,l;const f=B(),t={startTime:f.startTime,endTime:f.endTime};a&&(t.contactAlias=a);const s=await q.post("/feishu/app/ab/contactList",t);if(((m=s.data)==null?void 0:m.code)===200&&((u=s.data)!=null&&u.data)){const o=s.data.data.map((c,h)=>({id:h+1,name:c.nickName,alias:c.alias||c.nickName,wxId:c.wxId}));$(o),S&&o.length>0&&v(o[0])}else throw new Error(((l=s.data)==null?void 0:l.message)||"获取客户列表失败")},y=async()=>{k(!0);try{b.trim()?await L(b):await L()}catch(a){console.error("搜索客户失败:",a),x.error(a instanceof Error?a.message:"搜索客户失败"),$([])}finally{k(!1)}},F=a=>{const f=a.target.value;g(f),!j.current&&(d.current&&clearTimeout(d.current),d.current=setTimeout(()=>{y()},500))},M=()=>{j.current=!0},z=()=>{j.current=!1,y()},H=a=>{(i==null?void 0:i.id)===a.id?v(null):v(a)},Y=()=>{T(!0),_(i)},A=()=>{d.current&&(clearTimeout(d.current),d.current=null),g(""),$([]),v(null),k(!1),T(!1),j.current=!1,C()};return n.useEffect(()=>{p&&(S?(g(S),y()):(g(""),y()),T(!1))},[p,S]),n.useEffect(()=>()=>{d.current&&clearTimeout(d.current)},[]),e.jsxs(Z,{title:"选择客户",visible:p,onClose:A,width:500,className:`customer-select-modal ${R?"dark-theme":"light-theme"}`,destroyOnClose:!0,children:[e.jsxs("div",{className:"modal-body",children:[e.jsx("div",{className:"search-section",children:e.jsx(ee,{value:b,onChange:F,onCompositionStart:M,onCompositionEnd:z,onPressEnter:y,placeholder:"请输入客户微信昵称或备注",suffix:e.jsx(w,{type:"text",icon:e.jsx(G,{}),onClick:y,loading:P})})}),e.jsx("div",{className:"customer-list",children:P?e.jsx("div",{className:"loading",children:"搜索中..."}):N.length===0?e.jsx(W,{description:"暂无搜索结果"}):e.jsx("div",{className:"customer-items",children:N.map(a=>e.jsxs("div",{className:`customer-item ${(i==null?void 0:i.id)===a.id?"selected":""}`,onClick:()=>H(a),children:[e.jsxs("div",{className:"customer-info",children:[e.jsx("div",{className:"customer-name",children:a.name}),a.alias&&a.alias!==a.name&&e.jsx("div",{className:"customer-alias",children:a.alias}),e.jsx("div",{className:"customer-wxid",children:a.wxId})]}),e.jsx("div",{className:"select-indicator",children:(i==null?void 0:i.id)===a.id&&e.jsx("span",{className:"selected-check",children:"✓"})})]},a.id))})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",paddingTop:"20px",borderTop:"1px solid rgba(0,0,0,0.04)",marginTop:"8px"},children:e.jsxs(te,{size:16,children:[e.jsx(w,{onClick:A,disabled:r,children:"取消"}),e.jsx(w,{type:"primary",onClick:Y,loading:r,children:"确定"})]})})]})},re=p=>q.post("/feishu/app/ab/page",p),O=p=>q.post("/feishu/app/ab/bindContact",p),ye=()=>{var f;const{isDark:p}=V(),[S,E]=n.useState(!1),[I,C]=n.useState([]),[_,R]=n.useState(0),[b,g]=n.useState(1),[N,$]=n.useState(10),[i,v]=n.useState(K()),[P,k]=n.useState(!1),[r,T]=n.useState(null),d=J.useRef(!1),j=async(t=!1)=>{var s,m,u;if(!(!t&&d.current)){d.current=!0,E(!0);try{const l=i.format("YYYY-MM-DD"),o={pageNumber:b,pageSize:N,startTime:`${l} 00:00:00`,endTime:`${l} 23:59:59`},c=await re(o);if(((s=c.data)==null?void 0:s.code)===200&&((m=c.data)!=null&&m.data)){const h=c.data.data.data.map(D=>({...D,customer:D.contactAlias?{id:D.id,name:D.contactAlias,alias:D.contactAlias,wxId:D.contactWxId||""}:null}));C(h),R(c.data.data.total)}else throw new Error(((u=c.data)==null?void 0:u.message)||"获取录音列表失败")}catch(l){console.error("获取录音列表失败:",l),x.error(l instanceof Error?l.message:"获取录音列表失败"),C([]),R(0)}finally{E(!1)}}},B=()=>{g(1),d.current=!1,j(!0)},L=()=>{v(K()),g(1)},y=t=>{var m,u;if(!t.url){x.warning("录音文件不可用");return}const s=window.open("","_blank");s&&s.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>录音播放 - ${((m=t.customer)==null?void 0:m.name)||"未选择客户"}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: #f5f5f5;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              max-width: 600px;
              width: 100%;
            }
            h2 {
              margin: 0 0 20px 0;
              color: #1f2937;
            }
            .info {
              margin-bottom: 20px;
              padding: 15px;
              background: #f9fafb;
              border-radius: 8px;
            }
            .info-item {
              margin: 8px 0;
              color: #6b7280;
            }
            .info-item strong {
              color: #374151;
            }
            audio {
              width: 100%;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>录音播放</h2>
            <div class="info">
              <div class="info-item"><strong>客户:</strong> ${((u=t.customer)==null?void 0:u.name)||"未选择客户"}</div>
              <div class="info-item"><strong>开始时间:</strong> ${M(t.startTime)}</div>
              <div class="info-item"><strong>结束时间:</strong> ${M(t.endTime)}</div>
              <div class="info-item"><strong>时长:</strong> ${z(t.duration)}</div>
            </div>
            <audio controls autoplay>
              <source src="${t.url}" type="audio/mpeg">
              您的浏览器不支持音频播放。
            </audio>
          </div>
        </body>
        </html>
      `)},F=t=>{if(!t.url){x.warning("录音文件不可用");return}try{const s=document.createElement("a");s.href=t.url,s.download=t.filename||"recording.mp3",s.target="_blank",document.body.appendChild(s),s.click(),document.body.removeChild(s),x.success("开始下载录音")}catch(s){console.error("下载失败:",s),x.error("下载失败，请稍后重试")}},M=t=>t?K(t).format("YYYY-MM-DD HH:mm:ss"):"",z=t=>{if(!t)return"00:00:00";const s=Math.floor(t/60),m=Math.floor(s/60),u=s%60,l=Math.floor(t%60);return`${String(m).padStart(2,"0")}:${String(u).padStart(2,"0")}:${String(l).padStart(2,"0")}`},H=t=>{T(t),k(!0)},Y=()=>{k(!1),T(null)},A=async t=>{var s,m,u,l;if(r)try{if(t){const o=await O({id:r.id,contactWxId:t.wxId});if(((s=o.data)==null?void 0:s.code)===200)C(c=>c.map(h=>h.id===r.id?{...h,customer:t}:h)),x.success("客户绑定成功");else throw new Error(((m=o.data)==null?void 0:m.message)||"绑定客户失败")}else{const o=await O({id:r.id});if(((u=o.data)==null?void 0:u.code)===200)C(c=>c.map(h=>h.id===r.id?{...h,customer:null}:h)),x.success("客户绑定已清除");else throw new Error(((l=o.data)==null?void 0:l.message)||"清除客户绑定失败")}Y(),await j(!0)}catch(o){console.error("绑定客户失败:",o),x.error(o instanceof Error?o.message:"绑定客户失败"),Y()}},a=[{title:"客户",dataIndex:"customer",key:"customer",width:150,render:(t,s)=>e.jsx(w,{type:"text",className:`customer-btn ${s.customer?"has-customer":""}`,onClick:()=>H(s),children:s.customer?s.customer.name:"选择客户"})},{title:"开始时间",dataIndex:"startTime",key:"startTime",width:180,render:t=>e.jsx("span",{className:"time-cell",children:M(t)})},{title:"结束时间",dataIndex:"endTime",key:"endTime",width:180,render:t=>e.jsx("span",{className:"time-cell",children:M(t)})},{title:"时长",dataIndex:"duration",key:"duration",width:120,render:t=>e.jsx("span",{className:"duration-cell",children:z(t)})},{title:"操作",key:"action",width:150,fixed:"right",render:(t,s)=>e.jsxs("div",{className:"action-buttons",children:[e.jsx(w,{type:"link",size:"small",onClick:()=>y(s),disabled:!s.url,title:s.url?"播放录音":"录音文件不可用",children:"▶️ 播放"}),e.jsx(w,{type:"link",size:"small",onClick:()=>F(s),disabled:!s.url,title:s.url?"下载录音":"录音文件不可用",children:"📥 下载"})]})}];return n.useEffect(()=>{d.current=!1,j()},[b,N,i]),e.jsx(Q,{children:e.jsx(U,{locale:X,children:e.jsxs("div",{className:`recording-management-page ${p?"dark-theme":"light-theme"}`,children:[e.jsx("div",{className:"page-header",children:e.jsx("h1",{children:"录音管理"})}),e.jsx("div",{className:"filter-section",children:e.jsxs("div",{className:"filter-row",children:[e.jsxs("div",{className:"filter-item",children:[e.jsx("label",{className:"filter-label",children:"日期范围"}),e.jsx(se,{value:i,onChange:t=>t&&v(t),format:"YYYY-MM-DD",placeholder:"选择日期",className:"filter-input"})]}),e.jsxs("div",{className:"filter-actions",children:[e.jsx(w,{type:"primary",icon:e.jsx(G,{}),onClick:B,loading:S,children:"搜索"}),e.jsx(w,{icon:e.jsx(ae,{}),onClick:L,children:"重置"})]})]})}),e.jsx("div",{className:"table-section",children:e.jsx(ne,{columns:a,dataSource:I,rowKey:"id",loading:S,pagination:{current:b,pageSize:N,total:_,showSizeChanger:!0,showQuickJumper:!0,showTotal:t=>`共 ${t} 条`,onChange:(t,s)=>{g(t),$(s||10)}},locale:{emptyText:e.jsx(W,{image:W.PRESENTED_IMAGE_SIMPLE,description:"暂无录音数据"})},scroll:{x:900}})}),e.jsx(ie,{visible:P,defaultSearch:(r==null?void 0:r.contactAlias)||((f=r==null?void 0:r.customer)==null?void 0:f.name)||"",startTime:r?`${i.format("YYYY-MM-DD")} 00:00:00`:"",endTime:r?`${i.format("YYYY-MM-DD")} 23:59:59`:"",onClose:Y,onConfirm:A})]})})})};export{ye as default};
