import React, { useEffect, useState } from "react";
import { Form, Input, Radio, Button, Upload, Select, Image } from "antd";
import { IoCloudUploadOutline } from "react-icons/io5";
import axios from "axios";
import "./AddArticle.scss";

const { Dragger } = Upload;
const { TextArea } = Input;

type Props = {
  onClose?: () => void;
  onSubmit?: (values: any) => void;
  initialValues?: {
    title?: string;
    categories?: string;
    content?: string;
    status?: "public" | "private";
    image?: string;
    mood?: string;
  };
  submitText?: string;
  heading?: string;
};

export default function AddArticle({
  onClose,
  onSubmit,
  initialValues,
  submitText = "Add",
  heading = "Add New Article",
}: Props) {
  const [form] = Form.useForm();
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialValues?.image || null
  );
  const [categories, setCategories] = useState<{ value: number; label: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<{ id: number; name: string }[]>(
          "http://localhost:8080/categories"
        );
        setCategories(res.data.map(c => ({ value: c.id, label: c.name })));
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title,
        categoryId: initialValues.categoryId,
        content: initialValues.content,
        status: initialValues.status || "public",
        mood: initialValues.mood,
      });
      setImagePreview(initialValues.image || null);
    } else {
      form.resetFields();
      form.setFieldsValue({ status: "public" });
      setImagePreview(null);
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    onSubmit?.(values);
  };

  const handleFileChange = (info: any) => {
    const file = info.fileList?.[0]?.originFileObj;
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(initialValues?.image || null);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="article">
      <div className="article__head">
        <span className="article__icon" role="img" aria-label="page">
          📝
        </span>
        <h2>{heading}</h2>
        <button className="article__close" aria-label="close" onClick={onClose}>
          ✖
        </button>
      </div>

      <Form
        layout="vertical"
        className="article__form"
        form={form}
        onFinish={handleFinish}
      >
        <Form.Item
          label="Title:"
          name="title"
          rules={[{ required: true, message: "Please enter title" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Article Categories:"
          name="categoryId"
          rules={[{ required: true, message: "Please enter category" }]}
        >
          <Select
            placeholder="Select a category"
            options={categories}
          />
        </Form.Item>

        <Form.Item label="Mood:" name="mood">
          <Select
            options={[
              { value: "happy", label: "Happy" },
              { value: "sad", label: "Sad" },
              { value: "angry", label: "Angry" },
              { value: "confused", label: "Confused" },
              { value: "excited", label: "Excited" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Content:"
          name="content"
          rules={[{ required: true, message: "Please enter content" }]}
        >
          <TextArea rows={5} />
        </Form.Item>

        <div className="article__row">
          <Form.Item
            label="Status"
            name="status"
            initialValue="public"
            className="article__status"
          >
            <Radio.Group>
              <Radio value="public">public</Radio>
              <Radio value="private">private</Radio>
            </Radio.Group>
          </Form.Item>

          <div className="article__uploader-wrapper">
            {imagePreview && (
              <div className="image-preview">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                />
              </div>
            )}
            <Form.Item
              name="files"
              className="article__uploader"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
            >
              <Dragger
                multiple={false}
                showUploadList={false}
                className="uploader--clean"
                beforeUpload={() => false}
                onChange={handleFileChange}
              >
                <div className="uploader__icon">
                  <IoCloudUploadOutline />
                </div>
                <div className="uploader__title">Browse & choose files</div>
                <div className="uploader__hint">PNG, JPG up to 5MB</div>
              </Dragger>
            </Form.Item>
          </div>
        </div>

        <div className="article__actions">
          <Button
            className="article__submit"
            type="primary"
            htmlType="submit"
          >
            {submitText}
          </Button>
        </div>
      </Form>
    </div>
  );
}
