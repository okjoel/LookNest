import React from 'react';

export default function SavedAlbums({ albums }) {
  return (
    <div className="saved-albums">
      {albums.length === 0 ? (
        <p>No albums yet</p>
      ) : (
        albums.map(album => (
          <div key={album.id} className="album-card">
            <h4>{album.name}</h4>
            <div className="album-photos">
              {album.photos.map((photo, index) => (
                <img key={index} src={photo.imageUrl[0]} alt={`Album ${index}`} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
