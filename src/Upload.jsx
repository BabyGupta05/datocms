import { useState } from "react";
import axios from "axios";

function Upload() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    try {
      // Step 1: Request an upload URL from DatoCMS
      const uploadResponse = await axios.post(
        "https://site-api.datocms.com/upload-requests",
        {
          data: {
            type: "upload_request",
            attributes: {
              filename: file.name,
            },
          },
        },
        {
          headers: {
            Authorization: "Bearer 4f3bf7180887b6bab65c4834cfe5dc",
            Accept: "application/json",
            "X-Api-Version": "3",
            "Content-Type": "application/vnd.api+json",
          },
        }
      );

      const uploadUrl = uploadResponse.data.data.attributes.url;
      const uploadId = uploadResponse.data.data.id;

      // Step 2: Upload the file to the provided URL
      const fileUploadResponse = await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
          "X-Foo": "bar", // Use appropriate headers if required
        },
      });

      console.log("File uploaded successfully:", fileUploadResponse.status);

      // Step 3: Create or update the metadata for the uploaded file
      const metadataResponse = await axios.post(
        "https://site-api.datocms.com/uploads",
        {
          data: {
            type: "upload",
            attributes: {
              path: uploadId,
              author: "Mark",
              copyright: "2020 DatoCMS",
              default_field_metadata: {
                en: {
                  alt: "Description of the image",
                  title: "Title of the image",
                  custom_data: {},
                },
              },
            },
          },
        },
        {
          headers: {
            Authorization: "Bearer 4f3bf7180887b6bab65c4834cfe5dc",
            Accept: "application/json",
            "X-Api-Version": "3",
            "Content-Type": "application/vnd.api+json",
          },
        }
      );

      //Retrieve Job Result

      const pollJobResult = async (jobId) => {
        try {
          const result = await axios.get(
            `https://site-api.datocms.com/job-results/${jobId}`,
            {
              headers: {
                Authorization: "Bearer 4f3bf7180887b6bab65c4834cfe5dc",
                Accept: "application/json",
                "X-Api-Version": "3",
                "Content-Type": "application/vnd.api+json",
              },
            }
          );
          console.log("Job result:", result.data);
        } catch (error) {
          if (error.response?.status === 404) {
            console.log("Job still processing, retrying...");
            setTimeout(() => pollJobResult(jobId), 2000); // Retry after 2 seconds
          } else {
            console.error(
              "Error fetching job result:",
              error.response ? error.response.data : error.message
            );
          }
        }
      };

      pollJobResult(metadataResponse.data.data.id);
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <>
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={uploadFile}>Upload File</button>
      </div>
    </>
  );
}

export default Upload;
