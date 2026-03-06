import { api } from "../../services/api.service";

export const createLobby = (data)=>{
  return api.post("/lobby",data);
};

export const joinLobby = (code)=>{
  return api.post("/lobby/join",{code});
};

export const leaveLobby = (code)=>{
  return api.post(`/lobby/${code}/leave`);
};

export const getPlayers = (code)=>{
  return api.get(`/lobby/${code}`);
};

export const toggleReady = (code)=>{
  return api.patch(`/lobby/${code}/ready`);
};

export const startRace = (code)=>{
  return api.post(`/lobby/${code}/start`);
};