import React from "react";
import testApi from "./advanced-api";

// Advanced React example showing complex state management
export function AdvancedUserManagement() {
  const [users, error, loading, refresh] = testApi.users.getAll.useHook({});
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  // Handle user selection
  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Failed to load users</h2>
        <p>Error: {error.status}</p>
        <button onClick={() => refresh(true)}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="user-management">
      <header className="header">
        <h1>User Management</h1>
        <div className="actions">
          <button onClick={() => setShowCreateForm(!showCreateForm)}>{showCreateForm ? "Cancel" : "Add User"}</button>
          <button onClick={() => refresh()}>Refresh</button>
        </div>
      </header>

      {showCreateForm && (
        <CreateUserForm
          onSuccess={() => {
            setShowCreateForm(false);
            refresh();
          }}
        />
      )}

      <div className="main-content">
        <div className="users-list">
          <h2>Users ({users.length})</h2>
          <div className="users-grid">
            {users.map((user) => (
              <div key={user.id} className={`user-card ${selectedUserId === user.id ? "selected" : ""}`} onClick={() => handleUserSelect(user.id)}>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                <p>@{user.username}</p>
                {user.company && <small>{user.company.name}</small>}
              </div>
            ))}
          </div>
        </div>

        {selectedUserId && (
          <div className="user-details">
            <UserDetails userId={selectedUserId} />
          </div>
        )}
      </div>
    </div>
  );
}

// Component for user details with lazy loading
function UserDetails({ userId }: { userId: number }) {
  const [user, error, loading, refresh] = testApi.users.getById.useHook({
    path: { id: userId }
  });

  const [userAlbums, albumsError, albumsLoading] = testApi.albums.getByUser.useHook({
    path: { userId }
  });

  if (loading) return <div>Loading user details...</div>;
  if (error) return <div>Error loading user: {error.status}</div>;

  return (
    <div className="user-details-panel">
      <div className="user-header">
        <h2>{user.name}</h2>
        <button onClick={() => refresh()}>Refresh</button>
      </div>

      <div className="user-info">
        <div className="basic-info">
          <h3>Contact Information</h3>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          {user.phone && (
            <p>
              <strong>Phone:</strong> {user.phone}
            </p>
          )}
          {user.website && (
            <p>
              <strong>Website:</strong>
              <a href={user.website} target="_blank" rel="noopener noreferrer">
                {user.website}
              </a>
            </p>
          )}
        </div>

        {user.address && (
          <div className="address-info">
            <h3>Address</h3>
            <p>
              {user.address.street}, {user.address.suite}
            </p>
            <p>
              {user.address.city}, {user.address.zipcode}
            </p>
          </div>
        )}

        {user.company && (
          <div className="company-info">
            <h3>Company</h3>
            <p>
              <strong>{user.company.name}</strong>
            </p>
            <p>{user.company.catchPhrase}</p>
            <small>{user.company.bs}</small>
          </div>
        )}
      </div>

      <div className="user-albums">
        <h3>Albums</h3>
        {albumsLoading ? (
          <p>Loading albums...</p>
        ) : albumsError ? (
          <p>Error loading albums: {albumsError.status}</p>
        ) : (
          <div className="albums-list">
            {userAlbums.map((album) => (
              <div key={album.id} className="album-item">
                <span>#{album.id}</span>
                <span>{album.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Form component for creating users
function CreateUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    username: ""
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const response = await testApi.users.create({
      query: formData
    });

    if (response.status === "success") {
      onSuccess();
    } else {
      setError(response.status === "validation_error" ? "Please check your input data" : "Failed to create user");
    }

    setIsSubmitting(false);
  };

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <form className="create-user-form" onSubmit={handleSubmit}>
      <h3>Create New User</h3>

      <div className="form-group">
        <label>Name *</label>
        <input type="text" value={formData.name} onChange={handleChange("name")} required disabled={isSubmitting} />
      </div>

      <div className="form-group">
        <label>Email *</label>
        <input type="email" value={formData.email} onChange={handleChange("email")} required disabled={isSubmitting} />
      </div>

      <div className="form-group">
        <label>Username *</label>
        <input type="text" value={formData.username} onChange={handleChange("username")} required disabled={isSubmitting} />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  );
}

// Photo gallery component with pagination
export function PhotoGallery() {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [selectedAlbumId, setSelectedAlbumId] = React.useState<number | null>(null);
  const photosPerPage = 20;

  const [photos, error, loading] = testApi.photos.getAll.useHook({
    query: {
      _limit: photosPerPage,
      _start: currentPage * photosPerPage,
      ...(selectedAlbumId && { albumId: selectedAlbumId })
    }
  });

  const [albums] = testApi.albums.getAll.useHook({
    query: undefined
  });

  const handleAlbumFilter = (albumId: number | null) => {
    setSelectedAlbumId(albumId);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) return <div>Loading photos...</div>;
  if (error) return <div>Error loading photos: {error.status}</div>;

  return (
    <div className="photo-gallery">
      <div className="gallery-header">
        <h2>Photo Gallery</h2>

        <div className="filters">
          <select value={selectedAlbumId || ""} onChange={(e) => handleAlbumFilter(e.target.value ? Number(e.target.value) : null)}>
            <option value="">All Albums</option>
            {albums?.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="photos-grid">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-card">
            <img src={photo.thumbnailUrl} alt={photo.title} loading="lazy" />
            <div className="photo-info">
              <h4>{photo.title}</h4>
              <p>Album: {photo.albumId}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>
          Previous
        </button>

        <span>Page {currentPage + 1}</span>

        <button onClick={() => handlePageChange(currentPage + 1)} disabled={photos.length < photosPerPage}>
          Next
        </button>
      </div>
    </div>
  );
}

// Comments management with real-time updates
export function CommentsManager({ postId }: { postId: number }) {
  const [comments, error, loading, refresh] = testApi.comments.getByPost.useHook({
    path: { postId }
  });

  const [newComment, setNewComment] = React.useState({
    name: "",
    email: "",
    body: ""
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const response = await testApi.comments.create({
      query: {
        postId,
        ...newComment
      }
    });

    if (response.status === "success") {
      setNewComment({ name: "", email: "", body: "" });
      refresh(); // Refresh comments list
    }

    setIsSubmitting(false);
  };

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div>Error loading comments: {error.status}</div>;

  return (
    <div className="comments-manager">
      <h3>Comments ({comments.length})</h3>

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <div className="comment-header">
              <strong>{comment.name}</strong>
              <span className="email">({comment.email})</span>
            </div>
            <p>{comment.body}</p>
          </div>
        ))}
      </div>

      <form className="add-comment-form" onSubmit={handleSubmitComment}>
        <h4>Add Comment</h4>

        <input
          type="text"
          placeholder="Your name"
          value={newComment.name}
          onChange={(e) => setNewComment((prev) => ({ ...prev, name: e.target.value }))}
          required
          disabled={isSubmitting}
        />

        <input
          type="email"
          placeholder="Your email"
          value={newComment.email}
          onChange={(e) => setNewComment((prev) => ({ ...prev, email: e.target.value }))}
          required
          disabled={isSubmitting}
        />

        <textarea
          placeholder="Your comment"
          value={newComment.body}
          onChange={(e) => setNewComment((prev) => ({ ...prev, body: e.target.value }))}
          required
          disabled={isSubmitting}
          rows={3}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Comment"}
        </button>
      </form>
    </div>
  );
}

export default {
  AdvancedUserManagement,
  PhotoGallery,
  CommentsManager
};
