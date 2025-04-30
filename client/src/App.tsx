import Layout from './components/Layout'; // Import the Layout component
import ProfileInfoForm from './components/ProfileInfoForm'; // Import the form component
import './App.css'

function App() {
  // const [count, setCount] = useState(0) // Keep or remove state as needed

  return (
    <Layout>
      <main>
        {/* <p>Welcome to OneShot</p> // Optionally remove placeholder */}
        <ProfileInfoForm />
        {/* Add your main page content here */}
      </main>
    </Layout>
  );
}

export default App;
