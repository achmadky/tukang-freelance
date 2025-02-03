import React, { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

export default function TukangFreelancer() {
  const { data: session } = useSession();
  const [tukangList, setTukangList] = useState([]);
  const [filters, setFilters] = useState({ location: "", skills: "", price: "" });
  const [newTukang, setNewTukang] = useState({ name: "", photo: "", skills: "", location: "", rangePayment: "", contact: "" });

  useEffect(() => {
    async function fetchTukang() {
      const records = await pb.collection("tukang").getFullList();
      setTukangList(records);
    }
    fetchTukang();
  }, []);

  const filteredTukang = tukangList.filter((tukang) =>
    (!filters.location || tukang.location.includes(filters.location)) &&
    (!filters.skills || tukang.skills.includes(filters.skills)) &&
    (!filters.price || tukang.rangePayment <= filters.price)
  );

  const handleRegistration = async (e) => {
    e.preventDefault();
    await pb.collection("tukang").create(newTukang);
    setNewTukang({ name: "", photo: "", skills: "", location: "", rangePayment: "", contact: "" });
    const records = await pb.collection("tukang").getFullList();
    setTukangList(records);
  };

  return (
    <div>
      <header>
        {session ? (
          <button onClick={() => signOut()}>Logout</button>
        ) : (
          <button onClick={() => signIn("google")}>Login with Gmail</button>
        )}
      </header>

      <div>
        <h1>Tukang Freelancer Platform</h1>
        <input
          type="text"
          placeholder="Filter by Location"
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filter by Skills"
          onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
        />
        <input
          type="number"
          placeholder="Filter by Price"
          onChange={(e) => setFilters({ ...filters, price: e.target.value })}
        />
      </div>

      <ul>
        {filteredTukang.map((tukang) => (
          <li key={tukang.id}>
            <img src={tukang.photo} alt={tukang.name} width={50} />
            <h3>{tukang.name}</h3>
            <p>Skills: {tukang.skills}</p>
            <p>Price Range: {tukang.rangePayment}</p>
            <p>Used: {tukang.timesUsed} times</p>
            <p>Rating: {tukang.rating}</p>
            {session ? (
              <p>Contact: {tukang.contact}</p>
            ) : (
              <p>Login to see contact details</p>
            )}
          </li>
        ))}
      </ul>

      <h2>Register as a Tukang</h2>
      <form onSubmit={handleRegistration}>
        <input type="text" placeholder="Name" value={newTukang.name} onChange={(e) => setNewTukang({ ...newTukang, name: e.target.value })} required />
        <input type="text" placeholder="Photo URL" value={newTukang.photo} onChange={(e) => setNewTukang({ ...newTukang, photo: e.target.value })} required />
        <input type="text" placeholder="Skills" value={newTukang.skills} onChange={(e) => setNewTukang({ ...newTukang, skills: e.target.value })} required />
        <input type="text" placeholder="Location" value={newTukang.location} onChange={(e) => setNewTukang({ ...newTukang, location: e.target.value })} required />
        <input type="number" placeholder="Price Range" value={newTukang.rangePayment} onChange={(e) => setNewTukang({ ...newTukang, rangePayment: e.target.value })} required />
        <input type="text" placeholder="Contact (WhatsApp)" value={newTukang.contact} onChange={(e) => setNewTukang({ ...newTukang, contact: e.target.value })} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
