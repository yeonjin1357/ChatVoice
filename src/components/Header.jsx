import ThemeButton from "./ThemeButton";
import LogoutButton from "./LogoutButton";
import classes from "./Header.module.css";

const Header = () => {
  return (
    <header className={classes.header}>
      <LogoutButton></LogoutButton>
      <ThemeButton></ThemeButton>
    </header>
  );
};

export default Header;
