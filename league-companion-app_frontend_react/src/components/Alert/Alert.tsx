import 'bootstrap/dist/css/bootstrap.css';

interface Props {
    title: string;
    description: string;
    type: string;
    dismissable?: boolean;
    padding?: number;
    onDismiss?: () => void;
};

const Alert = ({ type, title, description, onDismiss, dismissable = false, padding = 2 }: Props) => {
  return (
    <div className={"m-" + padding + " alert alert-" + type + " d-flex justify-content-between align-items-center"} role="alert">
        <span><strong>{title}</strong> {description}</span>
        {dismissable && 
       <button onClick={onDismiss} type="button" className="btn-close" aria-label="Close" />}
    </div>
  )
}

export default Alert