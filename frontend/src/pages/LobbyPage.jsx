import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLobby } from "../features/lobby/lobbyAPI";
import "../styles/lobbyPage.css";

const Lobby = () => {

  const navigate = useNavigate();

  const [form,setForm] = useState({
    name:"",
    language:"JavaScript",
    level:1,
    maxPlayers:4
  });

  const handleChange = (e)=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value
    });
  };

  const handleSubmit = async(e)=>{
    e.preventDefault();

    try{

      const payload = {
        name:form.name,
        settings:{
          language:form.language,
          level:Number(form.level),
          maxPlayers:Number(form.maxPlayers)
        }
      };

      const res = await createLobby(payload);

      const code = res.data.lobby.code;

      

      navigate(`/room/${code}`);

    }
    catch(err){
      console.log(err);
      alert("Failed to create lobby");
    }
  };

  return(
    <div className="lobby-page">

      <div className="brand-panel">
        <h1>DEBUG RACE</h1>
        <p>Decode • Optimize • Accelerate</p>
      </div>

      <div className="form-panel">

        <div className="lobby-card">

          <h2>CREATE LOBBY TERMINAL</h2>

          <form onSubmit={handleSubmit}>

            <div className="input-group">
              <label>LOBBY NAME</label>
              <input
                name="name"
                type="text"
                required
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>LANGUAGE</label>
              <select name="language" onChange={handleChange}>
                <option>JavaScript</option>
                <option>Python</option>
                <option>Java</option>
                <option>C</option>
              </select>
            </div>

            <div className="input-group">
              <label>LEVEL</label>
              <select name="level" onChange={handleChange}>
                <option value="1">1 - Rookie Grid</option>
                <option value="2">2 - Code Circuit</option>
                <option value="3">3 - Logic Grand Prix</option>
                <option value="4">4 - Algorithm Arena</option>
                <option value="5">5 - Championship Circuit</option>
              </select>
            </div>

            <div className="input-group">
              <label>MAX PLAYERS</label>
              <select name="maxPlayers" onChange={handleChange}>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>

            <button className="create-btn">
              CREATE LOBBY
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Lobby;