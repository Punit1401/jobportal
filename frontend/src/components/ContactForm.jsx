import { useState } from 'react';
import axios from 'axios';

export default function ContactForm(){
  const [form,setForm] = useState({name:'',email:'',phone:'',message:''});
  const [msg,setMsg] = useState('');
  const submit = async (e)=>{
    e.preventDefault();
    try {
      await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/contact', form);
      setMsg('Sent');
      setForm({name:'',email:'',phone:'',message:''});
    } catch(err){ setMsg('Failed'); }
  }
  return (
    <form onSubmit={submit} className="max-w-xl mx-auto p-4">
      <input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Name" className="w-full mb-3 p-2 border rounded"/>
      <input required value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" className="w-full mb-3 p-2 border rounded"/>
      <textarea required value={form.message} onChange={e=>setForm({...form, message:e.target.value})} placeholder="Message" className="w-full mb-3 p-2 border rounded" />
      <div className="flex items-center space-x-3">
        <button type="submit" className="px-4 py-2 rounded border">Send</button>
        {msg && <span>{msg}</span>}
      </div>
    </form>
  );
}
