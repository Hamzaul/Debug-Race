import React, { createContext, useContext, useReducer, useEffect } from 'react';

const GameContext = createContext();

const initialState = {
  user: null,
  team: null,
  race: null,
  currentQuestion: null,
  questionIndex: 0,
  playerStats: {
    speed: 50,
    position: 0,
    lap: 1,
    streak: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    nitro: 0,
    shield: false
  },
  opponents: [],
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.7
  },
  gameStatus: 'idle' // idle, loading, lobby, racing, finished
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_TEAM':
      return { ...state, team: action.payload };
    
    case 'CLEAR_TEAM':
      return { ...state, team: null };
    
    case 'SET_RACE':
      return { ...state, race: action.payload };
    
    case 'SET_QUESTION':
      return { 
        ...state, 
        currentQuestion: action.payload.question,
        questionIndex: action.payload.index 
      };
    
    case 'UPDATE_PLAYER_STATS':
      return { 
        ...state, 
        playerStats: { ...state.playerStats, ...action.payload } 
      };
    
    case 'SET_OPPONENTS':
      return { ...state, opponents: action.payload };
    
    case 'UPDATE_OPPONENT':
      return {
        ...state,
        opponents: state.opponents.map(op =>
          op.id === action.payload.id ? { ...op, ...action.payload } : op
        )
      };
    
    case 'ADD_OPPONENT':
      const exists = state.opponents.find(op => op.id === action.payload.id);
      if (exists) return state;
      return { ...state, opponents: [...state.opponents, action.payload] };
    
    case 'REMOVE_OPPONENT':
      return {
        ...state,
        opponents: state.opponents.filter(op => op.id !== action.payload)
      };
    
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload } 
      };
    
    case 'SET_GAME_STATUS':
      return { ...state, gameStatus: action.payload };
    
    case 'RESET_GAME':
      return { 
        ...initialState, 
        user: state.user, 
        settings: state.settings 
      };
    
    case 'RESET_ALL':
      return initialState;
    
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('debugrace_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', payload: user });
      } catch (e) {
        localStorage.removeItem('debugrace_user');
      }
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('debugrace_user', JSON.stringify(state.user));
    }
  }, [state.user]);

  const value = {
    state,
    dispatch,
    // Helper functions
    isLoggedIn: !!state.user,
    isInTeam: !!state.team,
    isRacing: state.gameStatus === 'racing',
    isLeader: state.team?.leader === state.user?._id || 
              state.opponents.find(p => p.id === state.user?._id)?.isLeader
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export default GameContext;