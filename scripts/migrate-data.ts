import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function migrateData() {
  console.log("Starting data migration...");

  const pool = await mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tagamidsalip_db",
    port: parseInt(process.env.DB_PORT || "3306"),
    waitForConnections: true,
    connectionLimit: 10,
  });

  try {
    // Create mock users
    console.log("Creating users...");
    
    const users = [
      {
        id: "admin-1",
        email: "admin@midsalip.gov.ph",
        name: "LGU Administrator",
        password: await bcrypt.hash("admin123", 12),
        role: "admin",
      },
      {
        id: "owner-1",
        email: "owner@example.com",
        name: "Juan Dela Cruz",
        password: await bcrypt.hash("owner123", 12),
        role: "owner",
      },
      {
        id: "owner-2",
        email: "owner2@example.com",
        name: "Maria Santos",
        password: await bcrypt.hash("owner123", 12),
        role: "owner",
      },
      {
        id: "owner-3",
        email: "owner3@example.com",
        name: "Pedro Garcia",
        password: await bcrypt.hash("owner123", 12),
        role: "owner",
      },
    ];

    for (const user of users) {
      try {
        await pool.execute(
          `INSERT INTO users (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)`,
          [user.id, user.email, user.name, user.password, user.role]
        );
      } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`User ${user.email} already exists, skipping...`);
        } else {
          throw err;
        }
      }
    }

    console.log("Users created successfully");

    // Create mock boarding houses
    console.log("Creating boarding houses...");
    
    const mockBoardingHouses = [
      {
        id: "bh-1",
        ownerId: "owner-1",
        name: "Casa Esperanza Boarding House",
        barangay: "Poblacion",
        address: "123 Rizal Street, Poblacion, Midsalip",
        contactNumber: "09171234567",
        permitNumber: "BP-2024-001",
        permitIssueDate: "2024-01-15",
        permitExpiryDate: "2025-01-15",
        permitDocument: "/permits/bp-2024-001.pdf",
        latitude: 7.9061,
        longitude: 123.2668,
        isActive: true,
        permitStatus: "valid",
      },
      {
        id: "bh-2",
        ownerId: "owner-1",
        name: "Sunrise Dormitory",
        barangay: "Baguitan",
        address: "456 Magsaysay Avenue, Baguitan, Midsalip",
        contactNumber: "09179876543",
        permitNumber: "BP-2023-045",
        permitIssueDate: "2023-06-01",
        permitExpiryDate: "2024-06-01",
        permitDocument: "/permits/bp-2023-045.pdf",
        latitude: 7.915,
        longitude: 123.275,
        isActive: false,
        permitStatus: "expired",
      },
      {
        id: "bh-3",
        ownerId: "owner-2",
        name: "Green Valley Residence",
        barangay: "Lumbia",
        address: "789 National Highway, Lumbia, Midsalip",
        contactNumber: "09195551234",
        permitNumber: "BP-2024-012",
        permitIssueDate: "2024-03-01",
        permitExpiryDate: "2025-02-28",
        permitDocument: "/permits/bp-2024-012.pdf",
        latitude: 7.898,
        longitude: 123.258,
        isActive: true,
        permitStatus: "near-expiry",
      },
      {
        id: "bh-4",
        ownerId: "owner-3",
        name: "Mountain View Lodge",
        barangay: "Guinlin",
        address: "321 Sampaguita Street, Guinlin, Midsalip",
        contactNumber: "09188887777",
        permitNumber: "BP-2024-028",
        permitIssueDate: "2024-08-15",
        permitExpiryDate: "2025-08-15",
        permitDocument: null,
        latitude: null,
        longitude: null,
        isActive: false,
        permitStatus: "pending",
      },
    ];

    for (const bh of mockBoardingHouses) {
      try {
        await pool.execute(
          `INSERT INTO boarding_houses (id, owner_id, name, barangay, address, contact_number, permit_number, permit_issue_date, permit_expiry_date, permit_document, latitude, longitude, is_active, permit_status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [bh.id, bh.ownerId, bh.name, bh.barangay, bh.address, bh.contactNumber, bh.permitNumber, bh.permitIssueDate, bh.permitExpiryDate, bh.permitDocument, bh.latitude, bh.longitude, bh.isActive, bh.permitStatus]
        );
      } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Boarding house ${bh.name} already exists, skipping...`);
        } else {
          throw err;
        }
      }
    }

    console.log("Boarding houses created successfully");

    // Create mock rooms
    console.log("Creating rooms...");
    
    const mockRooms = [
      { id: "room-1", boardingHouseId: "bh-1", name: "Room 101", capacity: 4 },
      { id: "room-2", boardingHouseId: "bh-1", name: "Room 102", capacity: 3 },
      { id: "room-3", boardingHouseId: "bh-1", name: "Room 103", capacity: 2 },
      { id: "room-4", boardingHouseId: "bh-2", name: "Room A", capacity: 4 },
      { id: "room-5", boardingHouseId: "bh-3", name: "Unit 1", capacity: 6 },
    ];

    for (const room of mockRooms) {
      try {
        await pool.execute(
          `INSERT INTO rooms (id, boarding_house_id, name, capacity) VALUES (?, ?, ?, ?)`,
          [room.id, room.boardingHouseId, room.name, room.capacity]
        );
      } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Room ${room.name} already exists, skipping...`);
        } else {
          throw err;
        }
      }
    }

    console.log("Rooms created successfully");

    // Create mock occupants
    console.log("Creating occupants...");
    
    const mockOccupants = [
      { id: "occ-1", roomId: "room-1", name: "Maria Santos", contactNumber: "09171111111", moveInDate: "2024-02-01" },
      { id: "occ-2", roomId: "room-1", name: "Jose Garcia", contactNumber: "09172222222", moveInDate: "2024-03-15" },
      { id: "occ-3", roomId: "room-2", name: "Ana Reyes", contactNumber: "09173333333", moveInDate: "2024-01-20" },
      { id: "occ-4", roomId: "room-2", name: "Pedro Cruz", contactNumber: "09174444444", moveInDate: "2024-02-10" },
      { id: "occ-5", roomId: "room-2", name: "Carmen Lopez", contactNumber: "09175555555", moveInDate: "2024-04-01" },
      { id: "occ-6", roomId: "room-4", name: "Luis Mendoza", contactNumber: "09176666666", moveInDate: "2023-07-01" },
      { id: "occ-7", roomId: "room-5", name: "Rosa Aquino", contactNumber: "09177777777", moveInDate: "2024-04-01" },
      { id: "occ-8", roomId: "room-5", name: "Mark Tan", contactNumber: "09178888888", moveInDate: "2024-04-15" },
      { id: "occ-9", roomId: "room-5", name: "Elena Ramos", contactNumber: "09179999999", moveInDate: "2024-05-01" },
      { id: "occ-10", roomId: "room-5", name: "Carlo Reyes", contactNumber: "09170000000", moveInDate: "2024-05-15" },
    ];

    for (const occupant of mockOccupants) {
      try {
        await pool.execute(
          `INSERT INTO occupants (id, room_id, name, contact_number, move_in_date) VALUES (?, ?, ?, ?, ?)`,
          [occupant.id, occupant.roomId, occupant.name, occupant.contactNumber, occupant.moveInDate]
        );
      } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Occupant ${occupant.name} already exists, skipping...`);
        } else {
          throw err;
        }
      }
    }

    console.log("Occupants created successfully");
    console.log("Data migration completed!");

    await pool.end();
  } catch (error) {
    console.error("Error during migration:", error);
    await pool.end();
    throw error;
  }
}

// Run the migration
migrateData()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });

export { migrateData };