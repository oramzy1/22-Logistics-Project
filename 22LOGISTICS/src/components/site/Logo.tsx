import { Link } from "@tanstack/react-router";
import logo from '@/assets/Logo.png'

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 group">
       <img
         src={logo}
         alt="22 Logistics"
         className="w-15 h-15"
       />
    </Link>
  );
}