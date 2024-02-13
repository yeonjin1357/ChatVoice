import { useSelector } from "react-redux";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CharacterSelect from "./components/CharacterSelect";
import ChatInterface from "./components/ChatInterface";

import classes from "./App.module.css";

function App() {
  const theme = useSelector((state) => state.theme);

  return (
    <div className={classes.main} data-theme={theme}>
      <Header></Header>
      <CharacterSelect></CharacterSelect>
      <ChatInterface></ChatInterface>
      <Footer></Footer>
    </div>
  );
}

export default App;
