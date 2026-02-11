import { Card, CardBody, CardFooter, CardHeader, RadioGroup, Radio } from "@heroui/react";
import { useState } from "react";
import { Button } from "@heroui/react";
import {Input} from "@heroui/input";

const CreateAccountCard = ({goBack}) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState(null); 
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  const handleSubmit = async () => {
    setError(null);
    setMessage(null);

    if (!name || !password || !confirm || !role) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const endpoint =
      role === "student" ? "/auth/create-student" : "/auth/create-advisor";

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        goBack();
      }
    } catch (err) {
      setError("Server error.");
    }
  };

  return (
    <Card className="lin-card lin-card-tall">
        <p className="back-button">
            <span
              className="text-blue-200 underline cursor-pointer hover:text-white"
              onClick={() => goBack()}
            >
               ← Back
            </span>
          </p>
        <CardHeader className="lin-card-body">
        <h2 className="lin-card-header">
          Create Account
        </h2>
        </CardHeader>
      <CardBody className="lin-card-body">
        <Input
            isRequired
            className="lin-input"
            placeholder="Enter your name"
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />
        <Input
            isRequired
            className="lin-input"
            placeholder="Enter your password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          isRequired
          className="lin-input"
          placeholder="Enter your password"
          label="Confirm Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <RadioGroup 
            isRequired
            label="Select your role"
            value={role}
            onValueChange={(val) => setRole(val)}
            defaultValue={null}
        >
            <Radio value="student" className="radio-text">
                <p className="radio-text">
                Student
                </p>
            </Radio>
            <Radio value="faculty" className="radio-text">
                <p className="radio-text">
                Faculty
                </p>
            </Radio>
        </RadioGroup>
      </CardBody>
      <CardFooter className="lin-card-body">
      <Button className="lin-submit" onPress={handleSubmit}>Register</Button>
      </CardFooter>
    </Card>
  );
};

export default CreateAccountCard;
