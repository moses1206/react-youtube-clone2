import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Typography, Button, Form, Input, Icon, message } from 'antd';
import Dropzone from 'react-dropzone';
import Axios from 'axios';

const { TextArea } = Input;
const { Title } = Typography;

const PrivateOptions = [
  { value: 0, label: 'Private' },
  { value: 1, label: 'Public' },
];

const CategoryOptions = [
  { value: 0, label: 'Film & Animation' },
  { value: 1, label: 'Autos & Vehicles' },
  { value: 2, label: 'Music' },
  { value: 3, label: 'Pets & Animals' },
];

export default function VideoUploadPage(props) {
  const user = useSelector((state) => state.user.userData);

  const [VideoTitle, setVideoTitle] = useState('');
  const [Description, setDescription] = useState('');
  const [Private, setPrivate] = useState(0);
  const [Category, setCategory] = useState('Film & Animation');
  const [FilePath, setFilePath] = useState('');
  const [Duration, setDuration] = useState('');
  const [ThumbnailPath, setThumbnailPath] = useState('');

  const onTitleChange = (e) => {
    setVideoTitle(e.currentTarget.value);
  };

  const onDescriptionChange = (e) => {
    setDescription(e.currentTarget.value);
  };

  const onPrivateChange = (e) => {
    setPrivate(e.currentTarget.value);
  };

  const onCategoryChange = (e) => {
    setCategory(e.currentTarget.value);
  };

  const onDrop = (files) => {
    console.log(files);

    let formData = new FormData();
    const config = {
      header: { 'content-type': 'multipart/form-data' },
    };
    formData.append('file', files[0]);

    Axios.post('/api/videos/uploadfiles', formData, config).then((response) => {
      if (response.data.success) {
        console.log(response.data);

        let variable = {
          url: response.data.url,
          fileName: response.data.fileName,
        };

        setFilePath(response.data.url);

        Axios.post('/api/videos/thumbnail', variable).then((response) => {
          if (response.data.success) {
            setDuration(response.data.fileDuration);
            setThumbnailPath(response.data.url);
          } else {
            alert('썸네일 생성에 실패하였습니다. !!');
          }
        });
      } else {
        alert('비디오 업로드를 실패하였습니다. !!');
      }
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const variable = {
      writer: user._id,
      title: VideoTitle,
      description: Description,
      privacy: Private,
      filePath: FilePath,
      category: Category,
      duration: Duration,
      thumbnail: ThumbnailPath,
    };

    Axios.post('/api/videos/uploadVideo', variable).then((response) => {
      if (response.data.success) {
        console.log(response.data);

        message.success('성공적으로 업로드를 했습니다 !!');
        setTimeout(() => {
          props.history.push('/');
        }, 2000);
      } else {
        alert('비디오 업로드를 실패하였습니다. !!');
      }
    });
  };

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div>
        <Title level={2}>Upload Video</Title>
      </div>

      <Form onSubmit={onSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Drop Zone */}
          <Dropzone onDrop={onDrop} multiple={false} maxSize={800000000}>
            {({ getRootProps, getInputProps }) => (
              <div
                style={{
                  width: '300px',
                  height: '240px',
                  border: '1px solid lightgray',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <Icon type='plus' style={{ fontSize: '3rem' }} />
              </div>
            )}
          </Dropzone>
          {/* Thumbnail */}
          <div>
            {ThumbnailPath && (
              <img
                src={`http://localhost:5000/${ThumbnailPath}`}
                alt='thumbnails'
              />
            )}
          </div>
        </div>

        <br />
        <br />
        <label>Title</label>
        <Input onChange={onTitleChange} value={VideoTitle} />
        <br />
        <br />
        <label>Description</label>
        <TextArea onChange={onDescriptionChange} value={Description} />
        <br />
        <br />

        <select onChange={onPrivateChange} style={{ width: '150px' }}>
          {PrivateOptions.map((item, index) => (
            <option key={index} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <br />
        <br />
        <select onChange={onCategoryChange} style={{ width: '150px' }}>
          {CategoryOptions.map((item, index) => (
            <option key={index} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <br />
        <br />
        <Button type='primary' size='large' onClick={onSubmit}>
          Submit
        </Button>
      </Form>
    </div>
  );
}
