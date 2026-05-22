import { useState } from 'react';
import { S } from '../../theme.js';
import { hap } from '../../audio.js';
import { uid, rebuildPaths, findAndUpdate, findAndDelete, insertInto } from '../../lib.js';
import { Modal } from '../ui/Modal.jsx';
import { SpotifyBtn } from '../ui/SpotifyBtn.jsx';
import { EditorTree } from './EditorTree.jsx';
import { DirectoryModal } from './DirectoryModal.jsx';
import { TopicModal } from './TopicModal.jsx';
import { CardSetManager } from './CardSetManager.jsx';
import { ImportModal } from './ImportModal.jsx';
import { PromptModal } from '../ai/PromptModal.jsx';

export function LibraryEditor({library,onSave,onClose}){
  const[tree,setTree]=useState(library);
  const[modal,setModal]=useState(null);
  const addDir=(pid,t)=>{setTree(p=>rebuildPaths(insertInto(p,pid,{id:`dir-${uid()}`,title:t,type:"directory",children:[]})));setModal(null);};
  const addTopic=(pid,t)=>{setTree(p=>rebuildPaths(insertInto(p,pid,{id:`topic-${uid()}`,title:t,type:"topic",path:[],cards:[]})));setModal(null);};
  const renameNode=(id,t)=>{setTree(p=>rebuildPaths(findAndUpdate(p,id,n=>({...n,title:t}))));setModal(null);};
  const deleteNode=(id)=>{setTree(p=>rebuildPaths(findAndDelete(p,id)));};
  const saveCards=(topic)=>{setTree(p=>rebuildPaths(findAndUpdate(p,topic.id,()=>topic)));setModal(null);};
  const handleImport=(data)=>{setTree(p=>rebuildPaths(insertInto(p,"root",{...data,id:data.id||`topic-${uid()}`,type:"topic",path:data.path||[]})));setModal(null);};
  return(
    <>
      <Modal title="Your Library" onClose={onClose} width={640}>
        <EditorTree node={tree} isRoot onAddDir={id=>setModal({type:"dir",pid:id})} onAddTopic={id=>setModal({type:"topic",pid:id})} onEdit={n=>setModal({type:n.type==="directory"?"dir":"topic",node:n})} onDelete={deleteNode} onCards={n=>setModal({type:"cards",node:n})}/>
        <div style={{display:"flex",gap:10,marginTop:24,paddingTop:16,borderTop:`1px solid ${S.border}`,flexWrap:"wrap"}}>
          <SpotifyBtn variant="ghost" onClick={()=>setModal({type:"prompt"})}>Generate prompt</SpotifyBtn>
          <SpotifyBtn variant="ghost" onClick={()=>setModal({type:"import"})}>Import JSON</SpotifyBtn>
          <SpotifyBtn onClick={()=>{hap.success();onSave(tree);onClose();}}>Save library</SpotifyBtn>
        </div>
      </Modal>
      {modal?.type==="dir"&&!modal.node&&<DirectoryModal onSave={t=>addDir(modal.pid,t)} onClose={()=>setModal(null)}/>}
      {modal?.type==="dir"&&modal.node&&<DirectoryModal existing={modal.node} onSave={t=>renameNode(modal.node.id,t)} onClose={()=>setModal(null)}/>}
      {modal?.type==="topic"&&!modal.node&&<TopicModal onSave={t=>addTopic(modal.pid,t)} onClose={()=>setModal(null)}/>}
      {modal?.type==="topic"&&modal.node&&<TopicModal existing={modal.node} onSave={t=>renameNode(modal.node.id,t)} onClose={()=>setModal(null)}/>}
      {modal?.type==="cards"&&<CardSetManager topic={modal.node} onSave={saveCards} onClose={()=>setModal(null)}/>}
      {modal?.type==="import"&&<ImportModal onClose={()=>setModal(null)} onImport={handleImport}/>}
      {modal?.type==="prompt"&&<PromptModal onClose={()=>setModal(null)} onImport={handleImport}/>}
    </>
  );
}
