import './Navbar.css'
import logo_white from '../../assets/logo-white.png';
import logo_black from '../../assets/logo-black.png';
import search_white from '../../assets/search-w.png';
import search_black from '../../assets/search-b.png';
import toggle_light from '../../assets/day.png';
import toggle_dark from '../../assets/night.png';

const Navbar = ({theme, setTheme}) => {
  const toggle_mode = () => {
    theme === 'light' ? setTheme('dark') : setTheme('light');
  }
  
  return (
    <div className='navbar'>
      <img src={theme === 'light' ? logo_black : logo_white} alt="" className='logo'/>
      <ul>
        <li>section1</li>
        <li>section2</li>
        <li>section3</li>
        <li>section4</li>
        <li>section5</li>
      </ul>
      <div className='search-box'>
        <input type="text" placeholder='Search'/>
        <img src={theme === 'light' ? search_white : search_black} alt=""/>
      </div>
      <img onClick={()=>{toggle_mode()}} src={theme === 'light' ? toggle_dark : toggle_light} alt="" className='toggle-icon'/>
    </div>
  )
}

export default Navbar;
