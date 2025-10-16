import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const SongAnalytics = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'playCount', direction: 'descending' });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get('http://localhost:5000/api/admin/analytics/songs', config);
        setSongs(res.data);
      } catch (error) {
        console.error('Failed to fetch song analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const sortedSongs = React.useMemo(() => {
    let sortableSongs = [...songs];
    if (sortConfig.key) {
      sortableSongs.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableSongs;
  }, [songs, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FaSort />;
    }
    if (sortConfig.direction === 'ascending') {
      return <FaSortUp />;
    }
    return <FaSortDown />;
  };

  if (loading) return <p>Loading analytics...</p>;

  return (
    <div className="item-list">
      <h3>Song Analytics</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th onClick={() => requestSort('playCount')} className="sortable-header">
              Plays {getSortIcon('playCount')}
            </th>
            <th onClick={() => requestSort('likeCount')} className="sortable-header">
              Likes {getSortIcon('likeCount')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedSongs.map(song => (
            <tr key={song._id}>
              <td>{song.title}</td>
              <td>{song.artist}</td>
              <td>{song.playCount}</td>
              <td>{song.likeCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SongAnalytics;