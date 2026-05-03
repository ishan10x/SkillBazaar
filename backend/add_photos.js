const mysql = require('mysql2/promise');

const updateGigs = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'MYSQL123@Ishan',
      database: 'skillbazaar'
    });

    const updates = [
      { id: 1, url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80' },
      { id: 2, url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80' },
      { id: 3, url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80' },
      { id: 4, url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80' },
      { id: 5, url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80' },
      { id: 6, url: 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&q=80' },
      { id: 7, url: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80' },
      { id: 8, url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80' },
      { id: 9, url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80' },
      { id: 10, url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80' },
      { id: 11, url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80' },
      { id: 12, url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80' },
      { id: 13, url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80' },
      { id: 14, url: 'https://images.unsplash.com/photo-1516280440502-8610a2f79025?w=800&q=80' },
      { id: 15, url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80' },
      { id: 16, url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80' },
      { id: 17, url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80' },
      { id: 18, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80' },
      { id: 19, url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80' },
      { id: 20, url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80' },
      { id: 21, url: 'https://images.unsplash.com/photo-1515378960530-7c0da622941f?w=800&q=80' },
      { id: 22, url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80' },
      { id: 23, url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80' }
    ];

    for (const update of updates) {
      await connection.execute('UPDATE gigs SET image_url = ? WHERE id = ?', [update.url, update.id]);
    }
    
    console.log('Successfully updated 23 gigs with photos!');
    await connection.end();
  } catch (error) {
    console.error('Error updating DB:', error);
  }
};

updateGigs();
