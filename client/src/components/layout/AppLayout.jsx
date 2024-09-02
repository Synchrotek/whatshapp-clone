import Title from "../shared/Title";
import Header from "./Header";

const AppLayout = ({ children, className }) => {
    return <div className="h-screen flex flex-col justify-between">
        <Title />
        <Header />

        <div className={`flex w-full ${className} h-full`}>
            <div className="bg-red-600 w-[40%]">01</div>
            <div className="w-full">{children}</div>
            <div className="bg-green-800 w-[40%]">01</div>
        </div>

        <div>Footer</div>
    </div>;
}

export default AppLayout