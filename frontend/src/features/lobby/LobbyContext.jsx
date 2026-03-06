import { createContext, useContext, useState } from "react";
import {
  createLobby,
  joinLobby,
  leaveLobby,
  getPlayers
} from "./lobbyAPI";

const LobbyContext = createContext();

export const LobbyProvider = ({ children }) => {

  const [lobby,setLobby] = useState(null);
  const [players,setPlayers] = useState([]);
  const [loading,setLoading] = useState(false);

  const createNewLobby = async(data)=>{
    try{

      setLoading(true);

      const res = await createLobby(data);

      setLobby(res.data.lobby);

      return res.data;

    }
    catch(err){
      console.log(err);
      throw err;
    }
    finally{
      setLoading(false);
    }
  };

  const joinLobbyByCode = async(code)=>{
    try{

      setLoading(true);

      const res = await joinLobby(code);

      setLobby(res.data.lobby);

      return res.data;

    }
    catch(err){
      console.log(err);
      throw err;
    }
    finally{
      setLoading(false);
    }
  };

  const leaveCurrentLobby = async(code)=>{
    try{

      await leaveLobby(code);

      setLobby(null);
      setPlayers([]);

    }
    catch(err){
      console.log(err);
    }
  };

  const fetchPlayers = async(code)=>{
    try{

      const res = await getPlayers(code);

      setPlayers(res.data.players);

    }
    catch(err){
      console.log(err);
    }
  };

  return(

    <LobbyContext.Provider
      value={{
        lobby,
        players,
        loading,
        createNewLobby,
        joinLobbyByCode,
        leaveCurrentLobby,
        fetchPlayers
      }}
    >

      {children}

    </LobbyContext.Provider>

  );
};

export const useLobby = ()=>{
  return useContext(LobbyContext);
};