import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

type Props = {
	className?: string;
	children: ReactNode;
	onClose?: () => void;
	modalImage?: string;
	dismissable?: boolean;
	modalVideo?: ReactNode;
};

export default function A4AThemedModal( {
	className,
	children,
	onClose = () => {},
	modalImage,
	dismissable,
	modalVideo,
}: Props ) {
	return (
		<Modal
			className={ clsx( 'a4a-themed-modal', className ) }
			onRequestClose={ onClose }
			__experimentalHideHeader
		>
			<div className="a4a-themed-modal__wrapper">
				<div className="a4a-themed-modal__sidebar-image-container">
					{ modalImage && (
						<img className="a4a-themed-modal__sidebar-image" src={ modalImage } alt="" />
					) }
					{ modalVideo }
				</div>
				<div className="a4a-themed-modal__content">
					{ dismissable && (
						<Button className="a4a-themed-modal__dismiss-button" onClick={ onClose } plain>
							<Icon icon={ close } size={ 24 } />
						</Button>
					) }

					{ children }
				</div>
			</div>
		</Modal>
	);
}
