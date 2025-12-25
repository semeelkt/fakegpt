const conversationsEl = document.getElementById('conversations');
const messagesEl = document.getElementById('messages');
const promptEl = document.getElementById('prompt');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChat');
const modelSelect = document.getElementById('modelSelect');
const tempRange = document.getElementById('tempRange');

let currentConversation = { id: Date.now(), title: 'New chat', messages: [] };

function appendMessage(role, text){
  const div = document.createElement('div');
  div.className = 'message ' + (role === 'user' ? 'user' : 'assistant');
  div.innerText = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendMessage(){
  const text = promptEl.value.trim();
  if(!text) return;
  appendMessage('user', text);
  promptEl.value = '';
  currentConversation.messages.push({ role: 'user', content: text });

  // show placeholder
  appendMessage('assistant', '...');
  try{
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelSelect.value,
        temperature: parseFloat(tempRange.value),
        messages: currentConversation.messages
      })
    });
    const data = await res.json();
    // remove last placeholder
    const last = messagesEl.querySelector('.message.assistant:last-child');
    if(last) last.remove();
    if(data.error){
      appendMessage('assistant', 'Error: ' + (data.error.message||data.error));
      return;
    }
    const assistantMsg = data.assistant && data.assistant.content ? data.assistant.content : (data.raw && data.raw.choices && data.raw.choices[0] && data.raw.choices[0].message && data.raw.choices[0].message.content ? data.raw.choices[0].message.content : '');
    appendMessage('assistant', assistantMsg);
    currentConversation.messages.push({ role: 'assistant', content: assistantMsg });
    saveConversation();
  }catch(err){
    console.error(err);
    appendMessage('assistant','Network error');
  }
}

function saveConversation(){
  const all = JSON.parse(localStorage.getItem('fakegpt.conversations')||'[]');
  const others = all.filter(c=>c.id !== currentConversation.id);
  others.unshift(currentConversation);
  localStorage.setItem('fakegpt.conversations', JSON.stringify(others.slice(0,50)));
  renderConversations();
}

function renderConversations(){
  const all = JSON.parse(localStorage.getItem('fakegpt.conversations')||'[]');
  conversationsEl.innerHTML = '';
  all.forEach(c=>{
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.innerText = c.title || 'Chat';
    btn.onclick = ()=>{
      currentConversation = c; loadConversation();
    };
    conversationsEl.appendChild(btn);
  });
}

function loadConversation(){
  messagesEl.innerHTML = '';
  document.getElementById('chatTitle').innerText = currentConversation.title || 'Chat';
  (currentConversation.messages||[]).forEach(m=>appendMessage(m.role, m.content));
}

newChatBtn.onclick = ()=>{
  currentConversation = { id: Date.now(), title: 'New chat', messages: [] };
  loadConversation();
};

sendBtn.onclick = sendMessage;
promptEl.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }});

// init
renderConversations();
loadConversation();
