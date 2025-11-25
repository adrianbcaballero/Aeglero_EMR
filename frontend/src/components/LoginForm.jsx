import { Card, CardBody, CardFooter, CardHeader, Input } from "@heroui/react";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../Context";
import "../styles/Login.css";

const LoginFormCard = ({ role, goBack }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useUser();
  const navigate = useNavigate();

    const handleLogin = async () => {
      try {
          console.log('VITE_API_BASE:', import.meta.env.VITE_API_BASE);
          console.log('All env:', import.meta.env);
          console.log('Full URL:', `${import.meta.env.VITE_API_BASE}/auth/login`);
          const response = await fetch(`${import.meta.env.VITE_API_BASE}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: name, 
              password: password, 
              role: role, 
            }),
          });
        
          const data = await response.json();
        
          if (response.ok) {
            const userData = {id: data.id, name: data.name, role: data.role};
            setUser(userData);
            if (role === "student") {
              navigate("/student");
            } else if (role === "advisor") {
              navigate("/advisor");
            } else {
              alert("Unknown role");
            }
          } else {
            alert(data.error);
          }
        } catch(error) {
          console.error("Login error:", error);
          alert("An error occurred during login.");
        }
      };

  return (
    <Card className="lin-card">
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
            {role === 'student' ? 'Student' : 'Advisor'} Login
            </h2>
        </CardHeader>
      <CardBody className="lin-card-body-center">
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
      </CardBody>
      <CardFooter className="lin-card-body">
        <Button className="lin-submit" onPress={handleLogin}>Login</Button>
      </CardFooter>
    </Card>
  );
};

export default LoginFormCard;