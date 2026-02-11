import { Card, CardBody, CardFooter } from "@heroui/react";
import { Button } from "@heroui/react";
import "../styles/Login.css";

const ChoiceCard = ({onSelect}) =>{
    return(
        <Card className="lin-card">
            <h2 className="lin-card-header">You are...</h2>
      <CardBody className="lin-card-body">
          <Button className="lin-button" onClick={() => onSelect('student')}>
            Student
          </Button>
          <Button className="lin-button" onClick={() => onSelect('advisor')}>
            Faculty
          </Button>
      </CardBody>
      <CardFooter className="lin-card-body">
        <p className="text-white text-md">
            <span
              className="text-blue-200 underline cursor-pointer hover:text-white"
              onClick={() => onSelect('create')}
            >
              Create an Account
            </span>
          </p>
      </CardFooter>
    </Card>
    );
};

export default ChoiceCard;