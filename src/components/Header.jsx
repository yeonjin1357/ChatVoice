import ThemeButton from "./ThemeButton";
import classes from "./Header.module.css";

const Header = () => {
  return (
    <header className={classes.header}>
      <ThemeButton></ThemeButton>
    </header>
  );
};

export default Header;
