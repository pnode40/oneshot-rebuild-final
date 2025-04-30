import Layout from './components/Layout'; // Import the Layout component
import ProfileInfoForm from './components/ProfileInfoForm'; // Import the form component
import ProfilePreview from './components/ProfilePreview'; // Import the preview component
import './App.css'

function App() {
  // Mock data for the preview
  const mockProfileData = {
    fullName: "Jalen Smith",
    position: "WR",
    gradYear: "2026",
    school: "Sunset High School",
    cityState: "Austin, TX",
    height: "6'1\"",
    weight: "185 lbs",
    fortyYardDash: "4.5s",
    benchPress: "225 lbs",
  };

  return (
    <Layout>
      <main>
        {/* <p>Welcome to OneShot</p> // Optionally remove placeholder */}
        <ProfileInfoForm />
        <div className="my-8"> {/* Add some margin between form and preview */}</div>
        <ProfilePreview {...mockProfileData} /> {/* Pass mock data as props */}
        {/* Add your main page content here */}
      </main>
    </Layout>
  );
}

export default App;
