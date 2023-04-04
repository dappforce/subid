import { PayloadAction, createSlice } from '@reduxjs/toolkit'

type ChatSlice = {
  chatId: string | null
  isOpen: boolean
}
const initialState: ChatSlice = {
  chatId: null,
  isOpen: false,
}
const slice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    openChat: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        state.chatId = action.payload
      }
      state.isOpen = true
    },
    closeChat: (state) => {
      state.chatId = null
      state.isOpen = false
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen
    }
  },
})

export const chatActions = slice.actions

export default slice.reducer
