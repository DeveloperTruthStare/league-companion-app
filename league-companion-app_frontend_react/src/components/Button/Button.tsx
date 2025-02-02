interface Props {
  text: string;
  onClick?: () => void;
}

function Button({ text, onClick }: Props) {
  return (
    <button className="btn btn-secondary touchButton" onClick={onClick}>
      {text}
    </button>
  );
}

export default Button;
