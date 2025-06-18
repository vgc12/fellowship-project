
interface IFileUploadProps {
    name: string;
}

function FileUploadComponent(props: IFileUploadProps) {
    return(
        <input type="file" id={props.name} />
    )
}

export default FileUploadComponent;