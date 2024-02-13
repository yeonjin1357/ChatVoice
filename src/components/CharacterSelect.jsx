import CharacterCard from "./CharacterCard";
import classes from "./CharacterSelect.module.css";

const CharacterSelect = () => {
  return (
    <div className={classes.select_wrap}>
      <CharacterCard></CharacterCard>
    </div>
  );
};

export default CharacterSelect;
