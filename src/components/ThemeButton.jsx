import { useDispatch, useSelector } from "react-redux";
import { toggle } from "../features/theme/themeSlice";

import classes from "./ThemeButton.module.css";

const ThemeButton = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);

  return (
    <button className={classes.theme_button} onClick={() => dispatch(toggle())}>
      {theme === "light" ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
    </button>
  );
};

export default ThemeButton;
