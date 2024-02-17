import { FC } from "react";
import { Layout } from "../components/Layout";
import Upload from "./upload";

export const IndexPage: FC = () => {
	return (
		<Layout>
			<Upload />
		</Layout>
	);
};
