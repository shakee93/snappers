
interface GalleryImage {
  original: string
  thumbnail: string
}

type Results = {
  refreshJwtAuthToken: {
    authToken: string;
  };
};

export interface ContactInfo {
  phone: string;
  email: string;
  displayName: string;
}