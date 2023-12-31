import LoginImg from "@/assets/images/login.jpg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./cpn/index.css";
import {
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  message,
  Col,
  Row,
} from "antd";
import { useLoginStore } from "@/store";
import { GithubOutlined } from "@ant-design/icons";
import { testLogin } from "@/services";
function Login() {
  const { isForgetPassword, setForgetPassword } = useLoginStore();

  const [isLogin, setIsLogin] = useState(true);
  function handleRegister() {
    setIsLogin(!isLogin);
  }
  function handleLogin() {
    setIsLogin(!isLogin);
  }

  function handlePasswordLogin() {
    setForgetPassword(false);
    setIsLogin(true);
  }

  function handleLoginToggle() {
    setIsLogin(!isLogin);
  }

  return (
    <div className="flex h-100vh">
      <div className="w-3/10 bg-gray-300 hidden lg:block">
        <img
          className="vertical-top object-cover w-full h-full"
          src={LoginImg}
          alt=""
        />
      </div>
      <div className="w-100% flex-center lg:w-7/10">
        <div className="w-400px">
          <div className="font-bold text-18px">
            {isForgetPassword ? "修改密码" : "欢迎到来"}
          </div>
          <div className="my-4 text-14px">
            {isForgetPassword ? (
              <>
                <span>已经修改完密码啦 ? </span>
                <span
                  className="color-#1677ff cursor-pointer"
                  onClick={handlePasswordLogin}
                >
                  立即登录
                </span>
              </>
            ) : isLogin ? (
              <>
                <span>还没有账号 ? </span>
                <span
                  className="color-#1677ff cursor-pointer"
                  onClick={handleRegister}
                >
                  立即注册
                </span>
              </>
            ) : (
              <>
                <span>已经有账号啦 ? </span>
                <span
                  className="color-#1677ff cursor-pointer"
                  onClick={handleLogin}
                >
                  立即登录
                </span>
              </>
            )}
          </div>

          {isForgetPassword ? (
            <ForgetPasswordForm />
          ) : isLogin ? (
            <LoginForm />
          ) : (
            <RegisterForm isLogin={isLogin} onLoginToggle={handleLoginToggle} />
          )}
        </div>
      </div>
    </div>
  );
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { getUserInfo, setForgetPassword } = useLoginStore();
  const onFinish = async (values: any) => {
    try {
      await getUserInfo(values);
      message.success("登录成功");
      navigate("/dashboard");
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };
  async function forgetPassword() {
    // message.info("请联系管理员");
    // const res = await testLogin();
    // console.log(res);
    setForgetPassword(true);
  }
  return (
    <>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 24 }}
        style={{ maxWidth: 600 }}
        layout="vertical"
        initialValues={{ remember: true, layout: "vertical" }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="用户名"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="密码"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item<FieldType>
          name="remember"
          valuePropName="checked"
          wrapperCol={{ offset: 0, span: 24 }}
        >
          <div className="w-full flex justify-between">
            <Checkbox>记住我</Checkbox>
            <span
              className="color-#1677ff cursor-pointer"
              onClick={forgetPassword}
            >
              忘记密码 ?
            </span>
          </div>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
          <div>
            <Button type="primary" block size="large" htmlType="submit">
              立即登录
            </Button>
            <Divider>
              <span className="text-14px color-#969696">或者</span>
            </Divider>
            <Button
              style={{ background: "#000" }}
              type="primary"
              block
              size="large"
              htmlType="submit"
            >
              <GithubOutlined />
              Github
            </Button>
          </div>
        </Form.Item>
      </Form>
    </>
  );
};

const RegisterForm: React.FC = ({ isLogin, onLoginToggle }) => {
  const [form] = Form.useForm();

  const { userRegister } = useLoginStore();
  const onFinish = async (values: any) => {
    try {
      console.log(values);

      await userRegister(values);
      message.success("注册成功");
      setTimeout(() => {
        onLoginToggle();
      }, 800);
    } catch (error: Error & { message: string }) {
      message.error(error.message);
    }
  };
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 24 },
    },
  };
  return (
    <>
      <Form
        className={"custom-form"}
        {...formItemLayout}
        form={form}
        name="register"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Form.Item
          name="username"
          label="用户名"
          tooltip="What do you want others to call you?"
          rules={[
            {
              required: true,
              message: "Please input your nickname!",
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="nickname"
          label="昵称"
          tooltip="What do you want others to call you?"
          rules={[
            {
              required: true,
              message: "Please input your nickname!",
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="确认密码"
          dependencies={["password"]}
          hasFeedback
          rules={[
            {
              required: true,
              message: "Please confirm your password!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The new password that you entered do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            {
              type: "email",
              message: "The input is not valid E-mail!",
            },
            {
              required: true,
              message: "Please input your E-mail!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="验证码"
          extra="We must make sure that your are a human."
        >
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
                name="captcha"
                noStyle
                rules={[
                  {
                    required: true,
                    message: "Please input the captcha you got!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Button>Get captcha</Button>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error("Should accept agreement")),
            },
          ]}
        >
          <Checkbox>
            I have read the <a href="">agreement</a>
          </Checkbox>
        </Form.Item>
        <Form.Item>
          <Button type="primary" size="large" block htmlType="submit">
            注册
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

const ForgetPasswordForm: React.FC = ({ isLogin, onLoginToggle }) => {
  const [form] = Form.useForm();

  const { updatePassword } = useLoginStore();
  const onFinish = async (values: any) => {
    try {
      console.log(values);

      await updatePassword(values);
      message.success("修改成功");
    } catch (error: Error & { message: string }) {
      message.error(error.message);
    }
  };
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 24 },
    },
  };
  return (
    <>
      <Form
        className={"custom-form"}
        {...formItemLayout}
        form={form}
        name="register"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            {
              type: "email",
              message: "The input is not valid E-mail!",
            },
            {
              required: true,
              message: "Please input your E-mail!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="验证码"
          extra="We must make sure that your are a human."
        >
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
                name="captcha"
                noStyle
                rules={[
                  {
                    required: true,
                    message: "Please input the captcha you got!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Button>Get captcha</Button>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="确认密码"
          dependencies={["password"]}
          hasFeedback
          rules={[
            {
              required: true,
              message: "Please confirm your password!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The new password that you entered do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" size="large" block htmlType="submit">
            确认修改
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default Login;
