import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            🇯🇵 Japan Trip Planner
          </Link>
        </Typography>
        {token ? (
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} to="/">
              首頁
            </Button>
            <Button color="inherit" component={Link} to="/places">
              我的景點
            </Button>
            <Button color="inherit" component={Link} to="/trips">
              我的行程
            </Button>
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1 }} />
        )}
        {token ? (
          <Button color="inherit" onClick={handleLogout}>
            登出
          </Button>
        ) : (
          <Box>
            <Button color="inherit" component={Link} to="/login">
              登入
            </Button>
            <Button color="inherit" component={Link} to="/register">
              註冊
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

