import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const DEFAULT_TRAITS = ["Brave","Shy","Sarcastic","Loyal","Greedy","Kind","Hot-headed","Curious","Mysterious"];
const DEFAULT_REL = ["Friend","Enemy","Sibling","Romantic","Rival","Mentor"];

export default function CharacterStudio() {
  const [dark, setDark] = useState(true);
  const [sections, setSections] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [traits, setTraits] = useState(DEFAULT_TRAITS);
  const [relations, setRelations] = useState(DEFAULT_REL);
  const [selectedSection, setSelectedSection] = useState("");

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [trait, setTrait] = useState("");

  // SAVE / LOAD
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("studio"));
    if (saved) {
      setSections(saved.sections);
      setCharacters(saved.characters);
      setTimeline(saved.timeline);
      setTraits(saved.traits || DEFAULT_TRAITS);
      setRelations(saved.relations || DEFAULT_REL);
      setSelectedSection(saved.sections?.[0] || "");
    } else {
      setSections(["Main"]);
      setSelectedSection("Main");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("studio", JSON.stringify({ sections, characters, timeline, traits, relations }));
  }, [sections, characters, timeline, traits, relations]);

  // CREATE
  const addCharacter = () => {
    if (!name) return;
    setCharacters([...characters, {
      id: Date.now(),
      name,
      desc,
      trait,
      section: selectedSection,
      links: [],
      notes: "",
      color: "#888"
    }]);
    setName(""); setDesc(""); setTrait("");
  };

  const addSection = () => {
    const s = prompt("Section name:");
    if (s) setSections([...sections, s]);
  };

  const addTrait = () => {
    const t = prompt("New trait:");
    if (t) setTraits([...traits, t]);
  };

  const addRelationType = () => {
    const r = prompt("New relationship type:");
    if (r) setRelations([...relations, r]);
  };

  const linkCharacters = (a, b, type) => {
    setCharacters(chars => chars.map(c => {
      if (c.id === a) {
        return { ...c, links: [...c.links, { target: b, type }] };
      }
      return c;
    }));
  };

  const addTimeline = () => {
    const title = prompt("Event:");
    const time = prompt("Time:");
    if (title) setTimeline([...timeline, { id: Date.now(), title, time }]);
  };

  const filtered = characters.filter(c => c.section === selectedSection);

  return (
    <div className={dark ? "bg-black text-white min-h-screen p-6" : "p-6"}>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Character Studio Pro</h1>
        <Button onClick={() => setDark(!dark)}>Dark Mode</Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-4">
        {/* Sidebar */}
        <div className="space-y-2">
          <h2 className="font-bold">Sections</h2>
          {sections.map(s => (
            <Button key={s} onClick={() => setSelectedSection(s)}>{s}</Button>
          ))}
          <Button onClick={addSection}>+ Section</Button>

          <h2 className="font-bold mt-4">Customize</h2>
          <Button onClick={addTrait}>+ Trait</Button>
          <Button onClick={addRelationType}>+ Relationship</Button>
        </div>

        {/* Main */}
        <div className="col-span-3 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <Input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
              <Textarea placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />

              <Select onValueChange={setTrait}>
                <SelectTrigger><SelectValue placeholder="Trait" /></SelectTrigger>
                <SelectContent>
                  {traits.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>

              <Button onClick={addCharacter}>Add Character</Button>
            </CardContent>
          </Card>

          {/* Characters */}
          <div className="grid grid-cols-2 gap-4">
            {filtered.map(char => (
              <motion.div key={char.id} draggable
                onDragStart={e => e.dataTransfer.setData("id", char.id)}
                onDrop={e => {
                  const dragged = Number(e.dataTransfer.getData("id"));
                  const type = prompt("Relationship type:");
                  if (type) linkCharacters(char.id, dragged, type);
                }}
                onDragOver={e => e.preventDefault()}
              >
                <Card>
                  <CardContent className="p-3 space-y-1">
                    <h3 className="font-bold">{char.name}</h3>
                    <p>{char.desc}</p>
                    <p className="text-xs">{char.trait}</p>

                    <textarea
                      placeholder="Notes..."
                      value={char.notes}
                      onChange={(e)=>{
                        const val = e.target.value;
                        setCharacters(chars => chars.map(c => c.id===char.id ? {...c, notes: val} : c));
                      }}
                    />

                    <div className="text-xs">
                      {char.links.map((l,i)=>{
                        const t = characters.find(c=>c.id===l.target);
                        return t ? <div key={i}>{l.type}: {t.name}</div> : null;
                      })}
                    </div>

                    <Select onValueChange={(val)=>{
                      const [id,type] = val.split("|");
                      linkCharacters(char.id, Number(id), type);
                    }}>
                      <SelectTrigger><SelectValue placeholder="Connect" /></SelectTrigger>
                      <SelectContent>
                        {characters.filter(c=>c.id!==char.id).map(c=>
                          relations.map(r => (
                            <SelectItem key={c.id+r} value={`${c.id}|${r}`}>
                              {r} → {c.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Timeline */}
          <Card>
            <CardContent className="p-4">
              <h2 className="font-bold">Timeline</h2>
              <Button onClick={addTimeline}>+ Event</Button>
              {timeline.map(e => (
                <div key={e.id}>{e.time}: {e.title}</div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
